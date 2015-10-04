#!/usr/bin/env node

var fs        = require('fs');
var writeGood = require('../write-good');

var args      = process.argv.slice(2);
var inputData = null;

if (args[0] === '--version'){
  var version = require('../package.json').version;
  console.log('write-good version ' + version);
  process.exit(0);
}

var opts      = {
  weasel   : null,
  illusion : null,
  so       : null,
  thereIs  : null,
  passive  : null,
  adverb   : null,
  tooWordy : null,
  cliches  : null
};

var include = true;

args.filter(function (arg) {
  return arg.substr(0, 2) === '--';
}).map(function (arg) {
  return arg.substr(2);
}).forEach(function (arg) {
  if (arg.substr(0, 3) === 'no-') {
    opts[arg.substr(3)] = false;
  } else {
    opts[arg] = true;
    include = false;
  }
});

Object.keys(opts).forEach(function (name) {
  if (typeof opts[name] !== 'boolean') {
    opts[name] = include;
  }
});

var BUFSIZE = 256;
var buffer = new Buffer(BUFSIZE);
var bytesRead;
var result = "";

while (true) {
  bytesRead = 0;

  try {
    bytesRead = fs.readSync(process.stdin.fd, buffer, 0, BUFSIZE);
  } catch (e) {
      if (e.code === "EAGAIN") {
        console.error("ERROR: interactive stdin input not supported");
        process.exit(1);
      } else if (e.code === "EOF") {
        break;
      }
      throw e;
  }

  // No more stdin input available
  if (bytesRead === 0) {
    break;
  }

  result += buffer.toString(null, 0, bytesRead);
}

var suggestions = writeGood(result, opts);
console.log(JSON.stringify({ "suggestions": suggestions }));

process.exit(0);
