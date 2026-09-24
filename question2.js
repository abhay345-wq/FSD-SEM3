
const EventEmitter = require('events');

class Element extends EventEmitter {
    constructor(name, parent = null) {
        super();
        this.name = name;
        this.parent = parent;
    }

    addEventListener(type, handler) {
        this.on(type, handler);
    }

    removeEventListener(type, handler) {
        this.off(type, handler);
    }

    dispatchEvent(type, data = {}) {
        const event = {
            type: type,
            target: this,
            currentTarget: null,
            data: data,
            stopped: false,

            stopPropagation() {
                this.stopped = true;
            }
        };

        // Bubble from target to parent
        let element = this;

        while (element) {
            event.currentTarget = element;

            element.emit(type, event);

            if (event.stopped) {
                break;
            }

            element = element.parent;
        }
    }
}

// Create hierarchy: document -> form -> button
const documentElement = new Element('document');
const form = new Element('form', documentElement);
const button = new Element('button', form);

// Common click handler
function clickHandler(event) {
    console.log(
        `${event.currentTarget.name} received click | ` +
        `Target: ${event.target.name} | ` +
        `CurrentTarget: ${event.currentTarget.name}`
    );
}

// Attach click listeners
documentElement.addEventListener('click', clickHandler);
form.addEventListener('click', clickHandler);
button.addEventListener('click', clickHandler);

// Scenario A
console.log('--- Scenario A ---');
button.dispatchEvent('click');

// Scenario B: Stop propagation at form
function stopHandler(event) {
    console.log('Form stops propagation');
    event.stopPropagation();
}

form.addEventListener('click', stopHandler);

console.log('--- Scenario B ---');
button.dispatchEvent('click');

// Remove stop handler for next scenario
form.removeEventListener('click', stopHandler);

// Scenario C: Remove button listener
button.removeEventListener('click', clickHandler);

console.log('--- Scenario C ---');
button.dispatchEvent('click');

// Additional event: keypress on form
form.addEventListener('keypress', (event) => {
    console.log(
        `Form received keypress | ` +
        `Target: ${event.target.name} | ` +
        `CurrentTarget: ${event.currentTarget.name} | ` +
        `Data: ${event.data.key}`
    );
});

console.log('--- Keypress Event ---');
form.dispatchEvent('keypress', { key: 'A' });