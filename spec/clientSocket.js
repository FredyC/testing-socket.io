define(['client/socket', 'io', 'superagent', 'when'], function(
	clientSocket,  // client/socket
	io,            // io
	request,       // superagent
	when           // when
) {

	// helper function for the connection
	var connect = function(autoConnect) {
		var options = {
			'port': 4040, // connect to "live" server
			'force new connection': true, // create new socket for every connection
			'transports': ['websocket'], // don't bother with other transports
			'auto connect': !!autoConnect // connect only when really needed
		};

		// add devcookie to query object, since it cannot be added to XHR headers
		// see: https://github.com/LearnBoost/socket.io-client/issues/344#issuecomment-25883056
		options['query'] = "xs=devcookie";

		// since the real authorization is already tested in socketAuth.js spec, this can be done
		// much easier and in more transparent way

		return clientSocket(options);
	};

	describe('Client Socket', function() {

		it('should be an function', function() {
			clientSocket.should.be.a("function");
		});

		it('should return promise-like object', function() {
			var promise = clientSocket({'auto connect': false});
			when.isPromiseLike(promise).should.be.true;
		});

		it('should try to connect', function() {
			var spy = sinon.spy(io, 'connect');
			connect(false);
			spy.should.have.been.calledOnce;
			spy.restore();
		});

		it('should reject promise with bad cookie', function(done) {
			var stub = sinon.stub(io, 'connect', function(options) {
				return {
					on: function(name, cb) {
						if ("connect_failed" == name) {
							setTimeout(cb, 0);
						}
					}
				};
			});
			connect().otherwise(function() {
				stub.restore();
				done();
			});
		});

		it('should resolve promise when connected', function(done) {
			connect(true).tap(function(socket) {
				socket.disconnect();
				done();
			});
		});
	});
});