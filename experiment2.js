const fs = require('fs');

// CREATE
fs.writeFile('example.txt', 'Heyyy!! My name is Harshita Bhardwaj.', (err) => {
    if (err) throw err;
    console.log('File created!');

    // READ
fs.readFile('example.txt', 'utf8', (err, data) => {
    if (err) throw err;
    console.log('File content:', data);
});

// UPDATE (overwrite)
fs.writeFile('example.txt', 'This is the updated content.', (err) => {
if (err) throw err;
console.log('File overwritten (updated)!');
});

// UPDATE (append)
fs.appendFile('example.txt', '\nThis line was added.', (err) => {
if (err) throw err;
console.log('File updated (appended)!');
});

// DELETE
fs.unlink('example.txt', (err) => {
if (err) throw err;
console.log('File deleted!');
});
});



/*
//START -> END -> NEXT TRICK -> MACRO -> MICRO
console.log("1: Start (sync)");

setTimeout(() => {
    console.log("2: setTimeout (macroTask - timers phase)");
}, 0);

setImmediate(() => {
    console.log("3: setImmediate (macroTask - check phase)");
});

process.nextTick(() => {
    console.log("4: process.nextTick (highest priority microtask)");
});

Promise.resolve().then(() => {
    console.log("5: Promise.then (microtask)");
});



const fs = require("fs");

console.log("1: Start (sync)");

setTimeout(() => {
    console.log("2: Inside setTimeout (macrotask - runs LAST)");
}, 0);

Promise.resolve().then(() => {
    console.log("3: Inside Promise.then (microtask - runs BEFORE setTimeout)");
});

fs.readFile("filename", () => {
    console.log("4: Inside fs.readFile callback (I/O - runs later)");
});

console.log("5: End (sync)");
*/