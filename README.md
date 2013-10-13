# Testing client side Socket communication

Example project to show how Socket.IO communication can be tested on the client side INCLUDING
authorization with session cookies.

## Setup

You need NodeJS installed. Run `npm install` to install dependencies. It would also useful to install some
packages globally, otherwise you have to install them locally and reference on your own.

`npm install -g testem mocha nodemon`

## Server

Run `nodemon server.js` to start the server or simply `node server.js` if you like.

Server is handling socket communication including authorization. Accessing `http://localhost:4040` in the 
browser you see authorized socket connection being established. It even shows you sessionId sent back from
the server.

## Testing the code

Everything looks great, but once you want to test that code, you will have some trouble.

### Authorization

To check that authorization is working correctly, you don't need browser environment to that. You can simply
run tests againts running server instance using Mocha.

`mocha -R spec spec/socketAuth.js`

If you inspect code of that test closely, you can see that session cookie is retrieved through superagent
module. Than it's transmitted to socket connection by query string. Check the comments in code about this.

### Client connection

Once you know that authorization works correctly, you can rely on that fact and simply fake the authorization
for the sake of client tests.

Run the Test`em tool by running `testem` console. Thne simply navigate in browser of your choice to 
`http://localhost:7357`.

Issue here is that you cannot use superagent here to retrieve session cookie. This library just wraps the
built-in XMLHttpRequest object which is protected and session cookie cannot be read from it nor written.
So in this case authorization is simply faked and you can focus on testing true client functionality.
