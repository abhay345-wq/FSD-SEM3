
console.log('Script start');

setTimeout(() => {
    console.log('setTimeout callback');
}, 0);

setImmediate(() => {
    console.log('setImmediate callback');
});

Promise.resolve().then(() => {
    console.log('Promise callback');
});

process.nextTick(() => {
    console.log('process.nextTick callback');
});

console.log('Script end');