require.config({
  paths: {
    'chai': '/node_modules/chai/chai',
    'io': '/node_modules/socket.io-client/dist/socket.io',
    'superagent': '/node_modules/superagent/superagent',
    'when': '/node_modules/when/when'
  }
});

mocha.setup("bdd");

require([
  'chai', 
  '/node_modules/sinon-chai/lib/sinon-chai.js',
  '/node_modules/sinon/pkg/sinon.js',

  'spec/clientSocket' // load spec file

], function(chai, sinonChai) {
  chai.should();
  chai.use(sinonChai);
  return mocha.run();
});