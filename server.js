var express = require('express');
var http = require('http');

// parse cookies from request
var cookieParser = express.cookieParser('superSecret');
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

// setup listening for server and Socket.IO
var server = http.createServer(app);
server.listen(4040);
io = require('socket.io').listen(server);

// response for usual GET requests, nothing useful need to be send
app.get('/', function(req, res) {
	res.write('Hello '+req.sessionID);
	res.end();
});

// basic handling of the socket authorization for the production
var socketAuthorization = function(handshake, accept) {

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
			accept(null, true);
		});
	});
};

// changes required to make this work only for development environment
app.configure('development', function() {

	var auth = socketAuthorization;
	socketAuthorization = function(handshake, accept) {
		// if there is query string containing cookieName, it gets used directly
		// only value `devcookie` is accepted as valid
		// it gets temporary session object which can be used later during communication
		if (handshake.query && handshake.query[cookieName]) {
			handshake.sessionID = handshake.query[cookieName];
			handshake.session = new express.session.Session(handshake, {});
			return accept(null, handshake.sessionID == "devcookie");
		}

		// call the original
		auth(handshake, accept);
	}
});

io.set('authorization', socketAuthorization);

// say hello to the new socket connection
io.on('connection', function(socket) {
	socket.emit('hello');
});