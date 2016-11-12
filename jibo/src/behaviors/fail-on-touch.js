"use strict";

let jibo = require('jibo');
let Status = jibo.bt.Status;
let Decorator = jibo.bt.Decorator;
let SucceedOnTouch = require('./succeed-on-touch');

class FailOnTouch extends Decorator {
    constructor(options) {
        super(options);
        this.decorator = new SucceedOnTouch(options);
    }
    start() {
        return this.decorator.start();
    }
    stop() {
        this.decorator.stop();
    }
    update(result) {
        let status = this.decorator.update(result);
        if(status === Status.SUCCEEDED) {
            return Status.FAILED;
        }
        return status;
    }
}

jibo.bt.register('FailOnTouch', 'project', FailOnTouch);
module.exports = FailOnTouch;
