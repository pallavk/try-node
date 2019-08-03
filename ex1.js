#!/usr/bin/env node

"use strict";
// My first Node.js program
//process.stdout.write("Hello World\n");
var path = require("path");
var fs = require("fs");


// ***********************************************

function printHelp() {
    console.log("ex1 usage:");
    console.log("  ex1.js --file={FILENAME}");
    console.log("");
    console.log("--help                   print this help");
    console.log("--file={FILENAME}        process the file");
    console.log("");
}

var args = require("minimist")(process.argv.slice(2), {
    boolean: [ "help" ],
    string: [ "file" ]
});
// console.log(args);

if (args.help) {
    printHelp();
}
else if (args.file) {
    let filepath = path.resolve(args.file);
//  console.log(__dirname);
//  console.log(filepath);
    processFile(filepath);
}
else {
    error("Incorrect usage.", true);

}

function processFile(filepath) {
    var contents = fs.readFileSync(filepath,"utf8");
    console.log(contents);
    //process.stdout.write(contents);
}


function error(msg, includeHelp = false) {
    console.error(msg);
    if (includeHelp) {
        console.log("");
        printHelp();
    }
}