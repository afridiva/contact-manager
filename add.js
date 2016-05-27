#!/usr/bin/env node

// This needs some dependencies, so we require them
var filesystem = require("fs");
var Manager = require('./contacts');
var program = require('commander');
var prompt = require('prompt');
var request = require('superagent');

    console.log('I am here');

program
  .option('-n, --name <name>', 'The name of the contact')
  .option('-p, --phone number <phonenumber>', 'The phone number of the contact')
  .action(function() {
    // Run queries serially
    
      // Validate phone number
      if (phoneRegex.exec(program.phonenumber)) {
        manager.add(program);
      } else {

        var schema = {
          properties: {
            answer: {
              description: 'Phone number may not be valid. Are you sure you want to add ' + program.phonenumber + '? Y/N', 
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
            manager.add(program);
          }
        });
      }
  })
  .parse(process.argv);

  // if (!process.argv.slice(2).length) {
  //   program.outputHelp(make_red);
  // }
 
  // function make_red(txt) {
  //   return colors.red(txt); //display the help text in red on the console 
  // }