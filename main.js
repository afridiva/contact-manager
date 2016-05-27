#!/usr/bin/env node

// This needs some dependencies, so we require them
var filesystem = require("fs");
var sqlite3 = require("sqlite3").verbose();
var program = require('commander');
var prompt = require('prompt');
var jsonfile = require('jsonfile');
var path = require('path');
var request = require('superagent');
var consumerInfo = jsonfile.readFileSync(path.join(__dirname, './consumer.json'));


// Enclose functions inside exports so it can be used in other scripts
var manager = new Manager('manager');

module.exports = manager;

function Manager(owner) {
  this.owner = owner;
  this.db = this.initDb;

  // Initialize database for user
  this.initDb = function() {
    
    var db = new sqlite3.Database(this.owner + '.db');
    // Run queries serially
    db.serialize(function(){

      // Create table if the table does not exist
      db.run("CREATE TABLE IF NOT EXISTS contacts (first_name TEXT, last_name TEXT, phone_number TEXT)");

    });
    return db;
  };

  // Function for adding contact to database
  this.add = function(firstName, lastName, phonenumber) {
      var db = this.initDb();
      var stmt = db.prepare("INSERT INTO contacts VALUES (?, ?, ?)");
      stmt.run(firstName, lastName, phonenumber);
      stmt.finalize();
      console.log(firstName + ' has been added successfully');
  };

  // This fetches the phone number from database and logs it in console
  this.search = function(name, sendText, message, manager) {
    var db = this.initDb();
    db.each("SELECT count(first_name) as count FROM contacts where first_name = '" + name + "' or last_name = '" + name + "'", function(err, row) {
              
          //check if users are more than 1 or not    
          if (row.count == 1) {
            db.each("SELECT first_name as first_name, phone_number as phone FROM contacts where first_name = '" + name + "' or last_name = '" + name + "'", function(err, row) {
              if(sendText == false) {
                    console.log(row.phone);
              }
              else {
                manager.sendText(name, row.phone, message);
              }
            });
          }

          // if users are more than 1, give options
          else if (row.count > 1) {
            var count = 1;
            var usersArray = [];
            db.each("SELECT first_name as first_name, last_name as last_name, phone_number as phone FROM contacts where first_name = '" + name + "' or last_name = '" + name + "'", function(err, row) {
                if (name == row.last_name)
                {
                  console.log('[' +  count++ + '] ' + row.first_name);
                }
                else
                {
                  console.log('[' +  count++ + '] ' + row.last_name);
                }
            });

            // prompt user for answer
            var schema = {
              properties: {
                option: {
                  description: 'Which ' + name + '?', 
                  type: 'string',                 // Specify the type of input to expect. 
                  pattern: /[1-9]/,                  // Regular expression that input must be valid against. 
                  message: 'You must enter one of the options', // Warning message to display if validation fails. 
                  required: true                        // If true, value entered must be non-empty.
                }
              }
            };

            prompt.start();
            prompt.get(schema, function (err, result) {
              var offset = result.option - 1;
              db.each("SELECT first_name as first_name, last_name as last_name, phone_number as phone FROM contacts where first_name = '" + name + "' or last_name = '" + name + "' LIMIT 1 OFFSET " + offset, function(err, row) {
                if(sendText == false) {
                        console.log(row.phone);
                }
                else {
                  manager.sendText(name, row.phone, message);
                }
              });
              
            });
          }
      });

  };

  // Function for sending text to contact
  this.sendText = function(name, number, message) {
    var phone = '';
    var db = this.initDb();
    var uri = '';
    console.log(name + ": " + number);

    //send sms with request module
    request
      .post('https://jusibe.com/smsapi/send_sms?to=' + encodeURIComponent(number) + '&from=ContactManager&message=' + encodeURIComponent(message))
      .auth(consumerInfo.username, consumerInfo.password)
      .end(function (err, res) {
        
        var errorMessage;
        if (res && res.status === 401) {
          errorMessage = "Authentication failed! Bad access token?";
        } else if (err) {
          errorMessage = err;
        } else {
          errorMessage = 'Message has been sent to ' + name + ' successfully';
        }
        console.error(errorMessage);
        process.exit(1);
      });
  };

  // List all contacts
  this.list = function() {
    var db = this.initDb();
    db.each("SELECT first_name as first_name, last_name as last_name, phone_number as phone FROM contacts", function(err, row) {
        console.log('First Name: ' + row.first_name + ", Last Name: " + row.last_name + ", Phone Number: " + row.phone);
      });
  };
}

