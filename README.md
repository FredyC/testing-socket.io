# Testing client side Socket communication

Example project to show how Socket.IO communication can be tested on the client side INCLUDING
authorization with session cookies.

## Setup

You need NodeJS installed. Run `npm install` to install dependencies.

## Server

Run `node server.js` to start the server. Or if you want to do some changes to the code, I recommend to install
[NodeMon](https://github.com/remy/nodemon) by running `npm install -g nodemon`. Than you can simply run 
`nodemon server.js`.

## Running the tests

It's made with [Test`em](https://github.com/airportyh/testem) tool. You have now installed locally with NPM and
you can simply run `node_modules/.bin/testem` from this directory. Or for easier access install it globally 
`npm install -g testem`.

Now simply open the browser of your choice and navigate to `http://localhost:7357`.

## How it works
Main issues comes from the fact, that you simply cannot receive session cookie from the server, read it by your
code and most importantly, you cannot add it to XHR headers when initiating Socket.IO connection. Solution is 
rather simple, but should work quite ok.

As I said, you cannot read session cookie value sent by server. Since your main concern is to have working socket
connection and security is not really required for development, you can simply fake it.

You can add query parameters when initiating socket connection by calling `io.connect()` method. You can add there
whatever you want. Than on the server during authorization you can check that and authorize that connection.

I know, it's not some really surprising solution, but it works. If you know about better way, feel free to work this
repo and show me.