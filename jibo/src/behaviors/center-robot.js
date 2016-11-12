"use strict";

let jibo = require('jibo');
let Status = jibo.bt.Status;
let Behavior = jibo.bt.Behavior;

class CenterRobot extends Behavior {
    constructor(options) {
        super(options);
        this.status = Status.INVALID;
    }
    start() {
        this.status = Status.IN_PROGRESS;
        var _this = this;
        jibo.animate.centerRobot(
            jibo.animate.dofs.ALL,
            this.options.isGlobal,
            function() {
                _this.status = Status.SUCCEEDED;
              }
        );
        return true;
    }
    update() {
        return this.status;
    }
}

jibo.bt.register('CenterRobot', 'project', CenterRobot);
module.exports = CenterRobot;
