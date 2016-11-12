"use strict";

let jibo = require('jibo');
let Status = jibo.bt.Status;
let Decorator = jibo.bt.Decorator;

class SucceedOnTouch extends Decorator {
    constructor(options) {
        super(options);
        this.status = Status.INVALID;
        this.onClick = this.onClick.bind(this);
    }
    start() {
        this.status = Status.IN_PROGRESS;
        document.addEventListener('click', this.onClick);
        return true;
    }
    onClick() {
        this.status = Status.SUCCEEDED;
        this.options.onTouch();
        this.cleanup();
    }
    cleanup() {
        document.removeEventListener('onclick', this.onClick)
    }
    stop() {
        this.cleanup(); //cleanup if this decorator is stopped
    }
    update(result) {
        if (this.status === Status.SUCCEEDED) {
            return Status.SUCCEEDED;
        }
        return result;
    }
}

jibo.bt.register('SucceedOnTouch', 'project', SucceedOnTouch);
module.exports = SucceedOnTouch;
