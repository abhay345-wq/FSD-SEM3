const EventEmitter = require("events");
const myEmitter = new EventEmitter();
myEmitter.on('greet',(name)=> {
    console.log('hello,${name}!Welcome to Node.js.');
});
myEmitter.on('exit',()=>{
    console.log("Application Closed.");
});
myEmitter.emit('greet','Harshita');
myEmitter.emit('exit');