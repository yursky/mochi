"use strict";

let jibo = require('jibo');
let path = require('path');
let dofs = jibo.animate.dofs;
let THREE = jibo.animate.THREE;

module.exports = function(callback) {
    let root = path.join(__dirname, '..');
    let keysPath = path.join(root, 'animations/dance.keys');
    let lookatBuilder = jibo.animate.createLookatBuilder();
    //This tells the animation system which part of the robot this animation
    //controls. This controlls all parts except the body.
    lookatBuilder.setDOFs(dofs.ALL.minus(dofs.BODY));
    lookatBuilder.setContinuousMode(true);
    jibo.animate.createAnimationBuilderFromKeysPath(keysPath, root, function(builder) {
        //In this case, this only animates the body.
        builder.setDOFs(dofs.BODY);
        builder.setNumLoops(5);
        let lookatIntance = lookatBuilder.startLookat(new THREE.Vector3(1, 0, 0.5));
        builder.on(jibo.animate.AnimationEventType.STOPPED, function() {
            //Once the animation is done, stop the LookAt.
            lookatIntance.stop();
            callback();
        });
        builder.play();
    })
};
