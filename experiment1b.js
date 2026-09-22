//eventemitter class
const EventEmitter = require("events");

// button class
class Button extends EventEmitter{}

//object
const button = new Button();

//click event listener
button.on('click',()=>{
    console.log("Button clicked");
});

//mouseover event listener
button.on('mouseover',()=>{
    console.log("mouse is over the button");
});
button.emit('click');
button.emit('mouseover');