#!/usr/bin/env node

// This needs some dependencies, so we require them
var filesystem = require("fs");
var manager = require('./main.js');
var program = require('commander');
var prompt = require('prompt');
var request = require('superagent');
var phoneRegex = /^([0]{1}[1-9]{1}[0-9]{7}|[0]{1}[1-9]{1}[0-9]{9})$/;

var fullName = process.argv[3];
var phonenumber = process.argv[5];

// Run queries serially
    
// Validate phone number
if (phoneRegex.exec(phonenumber)) {
  manager.add(fullName, phonenumber);
} else {

  var schema = {
    properties: {
      answer: {
        description: 'Phone number may not be valid. Are you sure you want to add ' + phonenumber + '? Y/N', 
        type: 'string',                 // Specify the type of input to expect. 
        pattern: /(y|n)/,                  // Regular expression that input must be valid against. 
        message: 'You must enter y or n', // Warning message to display if validation fails. 
        required: true                        // If true, value entered must be non-empty.
      }
    }
  };

  prompt.start();
  prompt.get(schema, function (err, result) {
  
    if (result.answer == 'y') {
      manager.add(fullName, phonenumber);
    }
  });
}