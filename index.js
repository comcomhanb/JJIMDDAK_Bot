"use strict";

var Components = require('./components.js');
var morgan = require('morgan');

// Create a server instance
var server = Components('/components');
server.use(morgan('combined'));

// Start the server listening..
server.listen(process.env.SERVICE_PORT || 8889);
