"use strict";

var util = require("util");
var path = require("path");
var fs = require("fs");
var Transform = require("stream").Transform;
var zlib = require("zlib");
var CAF = require("caf");

// ***********************************************

function printHelp() {
    console.log("ex3 usage:");
    console.log("  ex3.js --file={FILENAME}");
    console.log("");
    console.log("--help                   print this help");
    console.log("--file={FILENAME}        process the file");
    console.log("--in, -                  process stdin");
    console.log("--out                    print to stdout");
    console.log("--compress               gzip the stream");
    console.log("--uncompress             gunzip the stream");
    console.log("");
}

var args = require("minimist")(process.argv.slice(2), {
    boolean: ["help", "in", "out", "compress", "uncompress"],
    string: ["file"]
});

processFile = CAF(processFile); //the magic that makes processFile into a 'async'

// ** Helper function to signal end of stream
function streamComplete(stream) {
    return new Promise(function c(res) {
        stream.on("end", res);
    });
}

var BASE_PATH = path.resolve(
    process.env.BASE_PATH || __dirname
);

var OUTFILE = path.join(BASE_PATH,"out.txt");

if (args.help) {
    printHelp();
} else if (args.in || args._.includes("-")) {
    let tooLong = CAF.timeout(3, "Cancelling!  Took too long...");  // cancellation token
    processFile(tooLong, process.stdin).catch(error);
} else if (args.file) {
    let stream=fs.createReadStream(path.join(BASE_PATH, args.file));
    let tooLong = CAF.timeout(3, "Cancelling!  Took too long...");  // cancellation token
    processFile(tooLong, stream)
    .then(function() {
        console.log("Completed...");
    })
    .catch(error);
} else {
    error("Incorrect usage.", true);
}

function *processFile(signal, inStream) {
    var outStream = inStream;

    if (args.uncompress) {
        let gunzipStream = zlib.createGunzip();
        outStream = outStream.pipe(gunzipStream);
    }

    var upperStream = new Transform({
        transform(chunk, enc, cb) {
            this.push(chunk.toString().toUpperCase());
            cb();
        }
    });

    outStream = outStream.pipe(upperStream);

    if (args.compress) {
        let gzipStream = zlib.createGzip();
        outStream = outStream.pipe(gzipStream);
        OUTFILE = `${OUTFILE}.gz`;
    }

    var targetStream;
    if (args.out) {
        targetStream = process.stdout;
    } else {
        targetStream = fs.createWriteStream(OUTFILE);
    }

        outStream.pipe(targetStream);
        yield streamComplete(outStream);
}

function error(msg, includeHelp = false) {
    console.error(msg);
    if (includeHelp) {
        console.log("");
        printHelp();
    }
}