
const EventEmitter = require('events');

class SessionManager extends EventEmitter {
    constructor() {
        super();

        // greet event
        this.on('greet', (username) => {
            console.log(`Hello, ${username}! Welcome.`);
        });

        // Runs only once
        this.once('greet', () => {
            console.log('First login of the day!');
        });

        // exit event
        this.on('exit', (code) => {
            console.log(`Session closed with code ${code}. Goodbye!`);
        });
    }

    // Trigger only allowed events
    trigger(command, ...args) {
        if (command === 'greet' || command === 'exit') {
            this.emit(command, ...args);
        } else {
            console.log(`Unknown event: ${command}`);
        }
    }
}

// Create object
const session = new SessionManager();

// Error listener
session.on('error', (message) => {
    console.log('Error:', message);
});

// Emit greet three times
session.trigger('greet', 'Abhay');
session.trigger('greet', 'Rahul');
session.trigger('greet', 'Aman');

// Print current greet listener count
console.log('Greet listener count:',
    session.listenerCount('greet'));

// Emit exit
session.trigger('exit', 0);

// Unknown event
session.trigger('login');

// Emit custom error
session.emit('error', 'Something went wrong!');