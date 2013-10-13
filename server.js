var express = require('express');
var http = require('http');

// secret phrase to sign cookies
var secret = 'superSecret';
// parse cookies from request
var cookieParser = express.cookieParser(secret);
// name of session cookie
var cookieName   = "xs";
// session store
var sessionStore = new express.session.MemoryStore();

// some basic setup for the server, nothing fancy here
var app = express();
app.use(cookieParser);
app.use(express.session({
	key: cookieName, 
	store: sessionStore
}));
app.use('/lib', express.static(__dirname + "/node_modules"));
app.use('/client', express.static(__dirname + "/client"));

// setup listening for server and Socket.IO
var server = http.createServer(app);
server.listen(4040);
io = require('socket.io').listen(server);

// response for usual GET requests, nothing useful need to be send
app.get('/', function(req, res) {
	res.sendfile('index.html', {root: 'client'});
});

// basic handling of the socket authorization for the production
var socketAuthorization = function(handshake, accept) {

	// faked cookie is already present here in handshake.headers, so it can go unchanged

	io.log.debug("authorization received cookie `"+handshake.headers['cookie']+"`");

	// parse cookie header from handshake data
	cookieParser(handshake, {}, function(err) {
		if (err) {
			return accept(err, false);
		}

		var sessionId = handshake.signedCookies[cookieName] || handshake.cookies[cookieName];
		
		io.log.debug("authorization for session id `" + sessionId + "`");

		// find session in the store
		sessionStore.load(sessionId, function(err2, session) {
			if (err2) {
				return accept(err2, false);
			}
			if (!session) {
				io.log.warn("session id `"+sessionId+"` is not in store");
				return accept(null, false);
			}
			handshake.session = session;
			handshake.sessionID = sessionId;
			accept(null, true, handshake);
		});
	});
};

// changes required to make this work only for development environment
app.configure('development', function() {

	var auth = socketAuthorization;
	socketAuthorization = function(handshake, accept) {

		// there is query string containing cookieName, that means some test is probably running
		if (handshake.query && handshake.query[cookieName]) {

			var value = handshake.query[cookieName];
			
			// this is somewhat hacky solution, but since the real authorization is tested
			// in spec/socketAuth.js and there is no other way around currently, it can 
			// be smiled upon easily (for now)
			if (value == "devcookie") {

				// create new session in the store, so it can be retrieved later
				sessionStore.set(value, {cookie: {}});

				// this is not really needed, depends if authorization algorithm is reading
				// only signed cookies or accepting plain ones too
				var signature = require('cookie-signature');
				value = "s:" + signature.sign(value, secret);
			}

			// store cookie in handshake headers so it can be parsed by true algoritm
			handshake.headers['cookie'] = cookieName + "=" + value;
		}

		// call the remaining authorization process
		auth(handshake, accept);
	}
});

io.set('authorization', socketAuthorization);

// say hello to the new socket connection
io.on('connection', function(socket) {
	socket.emit('hello', socket.handshake.sessionID);
});