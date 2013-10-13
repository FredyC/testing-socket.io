var agent = require('superagent');
var io = require('socket.io-client');
var when = require('when');

// This simple test suite just makes sure, that authorization for socket connection
// is working as it should be. Only exception is using query string instead of headers.
// See the comment below.

describe('Socket authorization', function() {

	// Prepare promise that retrieves session cookie (omitted error handling for simplicity)
	cookiePromise = when.promise(function(resolve) {
		agent('http://localhost:4040', function(res) {
			// res.headers["set-cookie"] = [ "xs=cookieValue; httpOnly" ]
			resolve( res.headers["set-cookie"].pop().split(';')[0].split("=")[1] );
		});
	});

	it('should be accepted with valid cookie', function(done) {
		cookiePromise.then(function(sessionCookie) {

			// session cookie is added using query string which could be considered *unsafe*
			// checkout the comment by @erispice for more satisfying solution
			// https://github.com/LearnBoost/socket.io-client/issues/344#issuecomment-26205528
			
			var client = io.connect('http://localhost:4040', {
				'force new connection': true,
				query: "xs="+sessionCookie
			});
			client.on('connect', function() {
				client.disconnect();
				done();
			});
		});
	});	

	it('should be rejected with invalid cookie', function(done) {
		var client = io.connect('http://localhost:4040', {
			'force new connection': true,
			query: "xs=invalid"
		});
		client.on('error', function(err) {
			done();
		});
	});	
});