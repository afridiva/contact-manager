#!/usr/bin/env node

// This needs some dependencies, so we require them
var filesystem = require("fs");
var manager = require('./main.js');

// Declare created database file
var name = process.argv[2];

if (process.argv[2] != null && process.argv[2] != '')
{
	// Run queries serially
	manager.search(name);
}
else {
	console.error('Please enter the correct search command:');
  	console.log('node search.js <name>');
}