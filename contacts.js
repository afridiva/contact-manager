#!/usr/bin/env node

// This needs some dependencies, so we require them
var filesystem = require("fs");
var Manager = require('./main.js');
var program = require('commander');
var prompt = require('prompt');
var request = require('superagent');
var owner = '';

var schema = {
  properties: {
    owner: {
      description: 'Hi, welcome to your personal contacts manager. What is your name?', 
      type: 'string',                 // Specify the type of input to expect. 
      pattern: /^[a-zA-Z]+$/,                  // Regular expression that input must be valid against. 
      message: 'You must enter a name in letters', // Warning message to display if validation fails. 
      required: true                        // If true, value entered must be non-empty.
    }
  }
};

prompt.start();
prompt.get(schema, function (err, result) {

  try {
    var stats = fs.statSync(result.owner + '.db');
    console.log('You are now using ' + result.owner + '.db');
    var cmanager = new Manager(result.owner);
  }
  catch (e) {
    console.log(result.owner + '.db has been created. You can now use your contacts list');
  }
  owner = result.owner;
});
  module.exports = new Manager(owner);


