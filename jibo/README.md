# Jibo SDK Sample Code

These sample skills will walk you through different features of the Jibo SDK Behavior Editor. Each sample builds on the previous one, so make sure to do them in order. Refer to the [Jibo SDK Documentation](https://developers.jibo.com/sdk/docs) for further tools usage and API reference.

## To view sample code:

### 1. Install the sample-code skill

You will need a [GitHub](https://github.com/) account and an [SSH key](https://help.github.com/articles/generating-ssh-keys/) to clone this repository.

If you downloaded a ZIP file of the sample code, unzip it and skip to [Step 2](#install_the_jibo_module).

```
git clone git@github.jibo.com:sdk/sample-code.git

```

### 2. Install the jibo module

```
cd ~/<path>/sample-code
npm install
atom .
```
If you don't `npm install`, the Behavior Tree Tool cannot render the behaviors!

### 3. Play a sample behavior tree in the simulator

1. Press **cmd-r** (Macs) or **ctrl-r** (PCs) to run the sample behavior tree in the Jibo simulator.
2. To view the debugger, press **cmd-opt i** (Macs) or **ctrl-alt-i** (PCs), or click **View > Developer > Developer Tools**.
3. Press **cmd-r** (Macs) or **ctrl-r** (PCs) to stop the simulator.


### 4. Switch to the next sample behavior tree

1. Open the `sample-code` skill in Atom.
  * If you don't see the Project pane, click **View > Toggle Tree View** to open it.
1. Click **src > index.js** in the Project pane to open the skill's index.js file.
3. Change the following line of code from:

      `let root = factory.create('../behaviors/01-sequence');`

      to

      `let root = factory.create('../behaviors/xx-behavior-tree-name);`

      where `xx-behavior-tree-name` is the name of the next behavior tree.

## Sample Behavior Trees

### 01: Sequence

Plays two animations in sequence.

### 02: Parallel

Plays an animation and an audio file in parallel.

### 03: Generic Animation Event

Animations (`.keys` files) have the ability to dispatch generic events at specific keyframes.

An Event layer is included in `animations/greeting-with-event.keys`. Click the keyframe at frame 30 on the Event layer; you'll see that it is set to dispatch an event called `blink` in the Name property. The animation system dispatches the event on an emitter that the `StartOnAnimEvent` decorator is listening for. This decorator will start the PlayAudio behavior when the `blink` event is heard.

This allows a developer to synchronize logic with exact keyframes in an animation.

### 04: WhileCondition

A `WhileCondition` is a decorator that restarts a behavior that succeeds if a condition is met. In this example, the `WhileCondition` is restarting a sequence that plays two animations. Since the `WhileCondition` decorator always succeeds, these animations are played forever in sequence.

### 05: More Advanced WhileCondition

In this example, the `WhileCondition` decorates a `PlayAnimation` behavior directly. It creates a `self.count` variable in its initialization function and decrements the variable each time its condition function is called. When the conditional returns false (`self.count` is not 0), the `WhileCondition` allows the `PlayAnimation` behavior to succeed and a sound is played. As soon as `self.count` is decremented to 0, the `PlayAnimation` stops repeating.

### 06: Single-Shot Look-At

The `LookAt` behavior has two modes. In this example, the behavior is set to *single-shot mode*, which means that `getTarget` is called once and the behavior succeeds once Jibo does a best-effort look at that target. `TimeoutJs` is a behavior that does nothing for an amount of time. The whole sequence is repeated.

### 07: Continuous-Mode Look-At

In this example, `LookAt` is set to *continuous mode*. This means that `getTarget` will be called every frame to ask for a new target. In this mode, the behavior never succeeds; it always remains *in progress* until a decorator forces it to succeed or fail, or if a parent explicitly stops it.

### 08: Idle

This sample is similar to example 06. In this example, the `LookAt` sequence executes in parallel with an other sequence that makes Jibo blink at random intervals.

### 09: Switch

A `Switch` allows for branching logic within behavior trees and operates similar to a switch/case statement. The `Switch` attempts to play its children in sequence until one succeeds. The `Case` decorator fails a behavior before it has started if its conditional returns false, forcing the `Switch` to move on to its next child.

In this example, an `ExecuteScript` behavior sets a property on `notepad` that the `Case` decorators check against. One of two animations will be played.

### 10: Subtrees

A `Subtree` allows for encapsulation within other behaviors trees. They treat a whole `.bt` file as a single behavior.

The `getNotepad` argument allows a parent tree to pre-populate a Subtree's notepad, allowing a behavior trees to pass arguments to a subtree. The `behaviors/10-subtrees/choose-animation.bt` plays an animation according to a property on its notepad, which is set by its parent tree.

Subtrees can also return results. Every tree has a `result` object scoped to a single `.bt` file. Any function argument can add properties to this object. When the subtree returns, its parent tree gets that result object. This is how behavior trees deal with return values. If, for example, you had subtree called `get-persons-name.bt`, that subtree might be highly complex and encapsulate a range of behaviors, such as voice recognition, facial identification, and text-to-speech. From the point of view of the parent tree, the mechanism by which that subtree obtains a person's name is a black box, but the end result is that that subtree returns the appropriate information.

### 11: SucceedOn Decorators

SucceedOn decorators force a behavior to succeed. They may force success from an event emitted from an animation or emitter, a conditional, or a timeout. More sophisticated SucceedOn decorators might succeed a behavior if Jibo hears "Hey Jibo" or any arbitrary parsed rule.

In this example, there are three subtrees that all point to the `idle` behavior tree, which never succeeds unless decorated or explicitly stopped by a parent. The first subtree succeeds after 5 seconds, and then the robot zeros itself, blinks, and plays a sound. The second subtree succeeds when an event is emitted from the `emitter` object, available globally. The third subtree saves its start time and forces success after a period of time has passed.

### 12: StartOn Decorators

Decorators can also control when a behavior starts.

`StartOnAnimEvent` was introduced in example 3, and prevents its behavior from starting until an event is dispatched from an animation.

`StartOnCondition` is the most generic and flexible of the StartOn decorators, and will only start a behavior when the `condition` argument returns `true`. In this example, the `PlayAudio` behavior is started after a random amount of time between 2 and 6 seconds. The second `PlayAudio` behavior only starts after the `start` event is emitted from the global emitter.

### 13: Custom Behaviors

In addition to the built-in behaviors and decorators included in the Jibo SDK, developers can create their own custom ones. A custom behavior consists of two parts: the behavior code (`src/behaviors/center-robot.js`) and the schema (`schema/center-robot.json`). You must also `require` the behavior JavaScript file after `jibo.init` returns. See `src/main` for details.

In this example project, a custom behavior called `CenterRobot` is included. This behavior will center the robot either globally or locally. Globally centering Jibo will face him away from his cord in the back. Locally centering him will make Jibo sit upright in whatever direction he last procedurally looked at. In `behaviors/13-custom-behaviors.bt`, the robot first looks right, then it centers globally, then looks right again, and then centers locally.

### 14: Custom Decorators

Developers can also create custom decorators. In this example, `SucceedOnTouch` will force a behavior to succeed when Jibo's face is touched. In the simulator, click directly on Jibo's face to simulate touch input.

Decorators are very similar to behaviors in how to code them and hook them up. The biggest difference is is the update function:

#### Behavior's update function

A behavior only needs to return a status to the behavior tree engine.

```
update() {
    return Status.IN_PROGRESS;
}
```

#### Decorator's update function

When the engine runs its update cycle, it first updates the behavior before updating its decorators. The result of the behavior is passed into the update function of its decorators. Each decorator then has the opportunity to modify or change the status of the behavior its decorating:

#### Decorator update function that can force its behavior to succeed.

```
update(result) {
    if(this.doForceSuccess) {
        return Status.SUCCEEDED;
    }
    return result;
}
```
#### Decorator updated function that inverts the status of a finished behavior.

```
update(result) {
    if(result === Status.SUCCEEDED) {
        return Status.FAILED;
    }
    else if(result === Status.FAILED) {
        return Status.SUCCEEDED;
    }
    return result;
}
```

### 15: Multiple Decorators

Multiple decorators can be added to one behavior. The engine first updates the behavior, then updates the decorators in order from top to bottom. The first decorator to return either `Status.FAILED` or `Status.SUCCEEDED` wins, and all decorators on that behavior are stopped.

In this example, a subtree is decorated with both a `FailOnTouch` and `SucceedOnTouch` decorator. The subtrees are under a `Sequence` and a `Switch`. In order for `RobotCenter1` to be executed in the `Sequence`, the sibling above it must finish with `Stats.SUCCEEDED`. Since `SucceedOnTouch` is first, it wins, and succeeds the subtree. In order for `CenterRobot2` to be executed in the `Switch`, the sibling above it must finish with `Status.FAILED`. (Remember that `Switch` executes its children in order until one succeeds.) Since `FailOnTouch` is first, it wins, and fails the subtree, allowing the robot to center.

A `Switch` will play all of its behaviors in sequence until one succeeds.

### 16: Hey Jibo

Jibo can listen for speech through Audio Speech Recognition (ASR). He has two types of listening capabilities:

1. The first is embedded phrase-spotting. Phrase-spotting tends to be faster and more accurate, but is quite limited in what it can listen for. For now, Jibo only has one phrase he can spot: "Hey Jibo".

2. The second is cloud-based, which can listen for any arbitrary speech, but tends to take a bit longer to process than the embedded type.

In this example, Jibo idles until he hears "Hey Jibo," at which point he centers himself and does an excited dance. The `SucceedOnEmbedded` decorator forces the `idle` subtree to succeed when Jibo hears "Hey Jibo".

Launch the simulator, click on the `Chat` tab, and type `Hey Jibo` in the **Speak to Jibo here** box, press `enter`, and watch him dance. Jibo will hear `Hey Jibo` even if you type other things before and afterwards. If you type `Hey Jibo` and continue typing, he will hear it as soon as you enter a space.

### 17: Jibo Makes a Reservation

This is a small interaction where you ask Jibo to make a reservation. The `Listen` behavior points to the `order.rule` file. Rule files are explained in the [Speech Recognition](https://developers.jibo.com/sdk/docs/reference/jibo-atom-package/speech-recognition.html) section of the developer documentation. You can test the rule in the .rule file Test pane by typing the following:

`please reserve me a flight to boston massachusetts`

The test should return the following:

```
{
    "Input": "please reserve me a flight to boston massachusetts",
    "NLParse": {
        "state": "ma",
        "book": "air",
        "city": "boston"
    },
    "heuristic_score": 36
}
```

The `Listen` behavior in the behavior tree will listen for any strings that match the rule created in the `order.rule` file. The `Listen` behavior is in parallel with a sequence of an idle behavior and an `ExecuteScript` that centers the robot and turns on the LED. In the `Listen` behavior, Jibo listens for a 'hey-jibo' event and dispatches the 'listen' event that calls `order.rule`, which triggers the `SucceedOnEvent` decorator.

When the `Listen` behavior gets a valid `NLParse`, `notepad.results` is set, which is later used in the `TextToSpeechJs` behavior to produce a response.

### 18: `.bt` Files Are Node Modules

`.bt` files get transpiled to JavaScript files through `behaviorify/register` at runtime. Since they are JavaScript, they can require external `.js` files like any other node module. While function arguments are very useful as the glue that helps behaviors and decorators communicate, having too much code in a single argument can be cumbersome. In these circumstance, refactoring the code into an external file can help.

This behavior tree contains an `ExecuteScript` which requires `src/look-and-dance.js`. This file blends a static and a procedural animation. This animation combines a continuous mode `LookAt` that fixes Jibo's eye on one point while looping a dance animation on his body DOFs. Once the dance is over, the `LookAt` instance is stopped and the callback is called. In the behavior tree, the success callback is executed, the robot centers, and the tree returns with `Status.Succeeded`.

### 19: Jibo Sees the World

In this example, we access Jibo's Local Perceptual Space to continuously look at a moving target (face) in the environment. We begin by calling `jibo.lps.getClosestVisualEntity()` to get the closest item that Jibo believes is a human. This gives us back an `Entity` object.

From this object, we extract the position of the closest visual entity. Just like the Continuous `LookAt` in example 7, we return the position of the entity. If no entity is found, we return a constant position for him to look at. Because we have the `LookAt` behavior set to continuous mode, Jibo will constantly be updating and looking for a target.

To see Jibo look at a target, launch the simulator and click the **LPS** tab. Click **Add a Target** in the LPS pane. A target will appear in Jibo's environment. You can manipulate the position of this target using the keyboard shortcuts shown in the LPS pane. You can also see the target's ID, x, y, and z position.

### 20: Jibo Sees and Listens

Just like a physical robot, Jibo is able to both see and listen to his environment in the simulator. In this example, Jibo tracks a target using the `19-lps.bt` subtree until he hears `hey jibo`. We then use a `Parallel` behavior to simultaneously execute a `TextToSpeechJs`, which randomly selects from a few greeting phrases, and two `Random` behaviors. `Random` behaviors randomly choose one of their children to execute.  

To see this in the simulator, launch the skill and add a target to the scene like we did in example 19. You can manipulate the target because you are accessing  it via a subtree. To see the rest of the skill, click the **Chat** tab and type **hey jibo** into the chat box. He will say one of the phrases we've put in the `TextToSpeechJs` and randomly execute one of the `PlayAudio` and `PlayAnimation` children of the `Random` behavior. Then, since the whole sequence has a `WhileCondition`, the tree will restart.

### 21: Jibo Takes a Photo

In this example, we use the `TakePhoto` behavior to take a picture and display it on Jibo's screen. We use a `StartOnAnimEvent` decorator to take a photo on the exact frame in the `camera.keys` animation when the camera shutter closes. We write the photo's URL to the notepad, and then use an `ExecuteScript` behavior to create an image, set the source of the image to the photo's URL from the notepad, and display the photo element. After the photo has been displayed on Jibo's screen, we display Jibo's eye again.
