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

var manager = Manager.prototype;
// Enclose functions inside exports so it can be used in other scripts
module.exports = Manager;

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
  this.add = function(program) {
      var stmt = this.db.prepare("INSERT INTO contacts VALUES (?, ?)");
      stmt.run(program.name, program.phonenumber);
      stmt.finalize();
      console.log(program.name + ' has been added successfully');
  };

  // Function for adding contact to database
  this.search = function(name) {
    var phonenumber = this.dbFetch(name);
    console.log(phonenumber);
  };

  // This fetches the phone number from database and is used in search and sendText operations
  this.fetch = function(name) {
    this.db.all("SELECT rowid AS id, name, phone_number FROM contacts where last_name = " + name + " or first_name = " + name, function(err, rows) {
        if (rows.length == 1) {
          return row.phone_number;
        }
        else if (rows.length > 1) {
          var users = '';
          var usersArray = [];
          for(var i = 0; i < rows.length; i++) {
              if (name == rows[i].last_name) {
                users += ' [' + i + 1 + '] ' + rows[i].first_name;
              }
              else {
                users += ' [' + i + 1 + '] ' + rows[i].last_name;
              }
          }
          var schema = {
            properties: {
              option: {
                description: 'Which ' + program.name + '?' + users, 
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
                this.dbFetch(program.name + ' and first_name = ' + rows[result.option - 1]);
            }
            else {
              console.log('You must enter one of the options');
            }
          });
        }
    });
  };

  // Function for sending text to contact
  this.sendText = function(program) {
    var phone = this.dbFetch(program.name);
    request
      .post('https://jusibe.com/smsapi/send_sms/')
      .send('to', phone)
      .send('from', 'Contact Manager')
      .send('message', program.message)
      .set('Accept', 'application/json')
      .auth(consumerInfo.username, consumerInfo.password)
      .end(function (err, res) {
        if (res && res.ok) {
          var link = res.body.links.html.href;
          console.log(chalk.bold.cyan('Message sent to ') + program.name);
          process.exit(0);
        }

        var errorMessage;
        if (res && res.status === 401) {
          errorMessage = "Authentication failed! Bad access token?";
        } else if (err) {
          errorMessage = err;
        } else {
          errorMessage = res.text;
        }
        console.error(chalk.red(errorMessage));
        process.exit(1);
      });
  };
}