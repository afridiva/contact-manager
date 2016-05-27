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
  this.add = function(fullName, phonenumber) {
      var db = this.initDb();
      var names = fullName.split(" ");
      var firstName = names[0];
      var lastName = '';
      var stmt = db.prepare("INSERT INTO contacts VALUES (?, ?, ?)");
      if (names.length >= 2) {
        var lastName = names[1];
      }
      stmt.run(firstName, lastName, phonenumber);
      stmt.finalize();
      console.log(firstName + ' has been added successfully');
  };

  // Function for adding contact to database
  this.search = function(name) {
    var phonenumber = this.fetch(name);
    console.log(phonenumber);
  };

  // This fetches the phone number from database and is used in search and sendText operations
  this.fetch = function(name) {
    var db = this.initDb();
    db.all("SELECT first_name as fname, last_name as lname, phone_number as phone FROM contacts where last_name = " + name + " or first_name = " + name, 
      function (err, cntx) {
          if (cntx == 1) {
            console.log(rows.phone);
            return rows.phone;
          }
          else if (cntx > 1) {
          var users = '';
          var usersArray = [];
          for(var i = 0; i < rows.length; i++) {
              if (name == rows[i].lname) {
                users += ' [' + i + 1 + '] ' + rows[i].fname;
              }
              else {
                users += ' [' + i + 1 + '] ' + rows[i].lname;
              }
          }
          var schema = {
            properties: {
              option: {
                description: 'Which ' + name + '?' + users, 
                type: 'string',                 // Specify the type of input to expect. 
                pattern: /[1-9]/,                  // Regular expression that input must be valid against. 
                message: 'You must enter one of the options', // Warning message to display if validation fails. 
                required: true                        // If true, value entered must be non-empty.
              }
            }
          };

          prompt.start();
          prompt.get(schema, function (err, result) {
            if (result.option <= rows.length) {
                this.dbFetch(name + ' and first_name = ' + rows[result.option - 1]);
            }
            else {
              console.log('You must enter one of the options');
            }
          });
        }
      });

  };

  // Function for sending text to contact
  this.sendText = function(name, message) {
    var phone = '';
    var db = this.initDb();
    var uri = '';
    db.each("SELECT first_name as first_name, phone_number as phone FROM contacts where first_name = '" + name + "' or last_name = '" + name + "'", function(err, row) {
        console.log(row.first_name + ": " + row.phone);
        phone = row.phone;

        //send sms with request module
        request
          .post('https://jusibe.com/smsapi/send_sms?to=' + encodeURIComponent(phone) + '&from=ContactManager&message=' + encodeURIComponent(message))
          .auth(consumerInfo.username, consumerInfo.password)
          .end(function (err, res) {
            
            var errorMessage;
            if (res && res.status === 401) {
              errorMessage = "Authentication failed! Bad access token?";
            } else if (err) {
              errorMessage = err;
            } else {
              errorMessage = res.text;
            }
            console.error(errorMessage);
            process.exit(1);
          });
      });
  };
}