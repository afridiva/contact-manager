#!/usr/bin/env node

// This needs some dependencies, so we require them
var filesystem = require("fs");
var manager = require('./main.js');

// Declare created database file
var name = process.argv[2];

// Run queries serially
manager.search(name);