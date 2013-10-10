define(['io', 'when'], function(
	io,  // io
    when // when
) {
	// simple Socket.IO connector using promises
	return function(options) {
		options = options || {};

		// connect to global socket namespace
		var global = io.connect(null, options)

		// create promise for connection
		return when.promise(function(resolve, reject) {
			global.socket.on('connect', function() { resolve(global) });
			global.socket.on('connect_failed', reject);
			global.socket.on('error', reject);
		});
	}

});