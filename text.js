#!/usr/bin/env node

// This needs some dependencies, so we require them
var filesystem = require("fs");
var manager = require('./main.js');
var request = require('superagent');
var phoneRegex = /^([0]{1}[1-9]{1}[0-9]{7}|[0]{1}[1-9]{1}[0-9]{9})$/;

if (process.argv[3] == '-m' && process.argv[4] != '' && process.argv[4] != null)
{
	var name = process.argv[2];
	var message = process.argv[4];

	// Run queries serially

	manager.search(name, true, message, manager);
}
else {
	console.error('Please enter the correct text command:');
  	console.log('node text.js <name> -m <message>');
}