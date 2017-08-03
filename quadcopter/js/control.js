// Quadcopter ontroller settings

var maxRoll         = 20;
var maxPitch        = 20;
var yawStabilize    = true;
var yawScale        = 153;         // [0 - 255], 60% * (255 / 100%) = 153
var printPosition   = true;
var yawLimits       = 20;           // [px] Width of the are of the yaw controller where yaw = 0
var yawTrim         = true;
var yawTrimValue    = 20;
var controllerMode  = 'attitude';   // 'attitude' or 'rate'
var fsCounter       = 0;            // Failsafe counter, must increase by 1 every time EX char is sent

// Define byte indexes for joystick data in the EX characteristic
var output =    {
                    throttle        : 0,
                    rollRight       : 1,
                    rollLeft        : 2,
                    pitchForward    : 3,
                    pitchBackward   : 4,
                    yawRight        : 5,
                    yawLeft         : 6,
                    calibrate       : 10,
                    mode            : 11,
                    altitude        : 12,
                    failSafe        : 19
                };


var originalPidData = new Uint8Array(20);
var calibrateCounter = 0;

// Give input elements index corresponding to relevant bytes in characteristics
var inputMap = [    'placeholder',
                    '#roll-slave-p', '#roll-slave-i', '#roll-slave-d',
                    '#pitch-slave-p', '#pitch-slave-i', '#pitch-slave-d',
                    '#yaw-slave-p', '#yaw-slave-i', '#yaw-slave-d',
                    '#roll-master-p', '#roll-master-i', '#roll-master-d',
                    '#pitch-master-p', '#pitch-master-i', '#pitch-master-d',
                    '#yaw-master-p', '#yaw-master-i', '#yaw-master-d'];



/*  BLE functions  */



//**
//     Joystick, based on the amazing nippleJS by @yoannmoinet: http://yoannmoinet.github.io/nipplejs/
//**

/** Joystick left  **/
var joystickLeft = nipplejs.create({
    zone: select('#joystick-left'),
    mode: 'static',
    position: {left: '100px', top: '40%'},
    color: 'rgb(25, 66, 103)',
    size: 150,
    restOpacity: 0.95
});
var joystickLeftPos = joystickLeft.position;
var joystickSize = joystickLeft.options.size;
var joystickCenter = joystickSize / 2;

// Function for positioning the left joystick correctly at the bottom when released
function reapplyLeft(el) {
    select(el).style.top = "75px";
}

// Apply style to joysticks on load
(function() {
    setTimeout(function() {
        reapplyJoystick();
    }, 1500);
})();

// Doing some changes to the joystick styling on load. This function is used instead
// of making changes to the nippleJS source files. (static CSS applies to some elements, but not all)
function reapplyJoystick() {

    // Set gradient for front on left joystick
    var front_l = select(".collection_0 .front").style;
    var front_r = select(".collection_1 .front").style;
    var back_l = select(".collection_0 .back");

    front_l.background = "radial-gradient(ellipse at center,  rgba(51, 110, 163, 1) 0%, rgba(25, 66, 103, 1) 100%)";
    front_r.background = "radial-gradient(ellipse at center,  rgba(196, 2, 2, 1) 0%, rgba(145, 4, 4, 1) 100%)";
    front_l.opacity = 1;
    front_r.opacity = 1;

    // Insert borders for yaw in left joystick
    var el = document.createElement("div");
    back_l.appendChild(el);
    el.className += "back-limits";
    select('.back-limits').style.width = ((yawLimits * joystickSize) / 100) + 'px';
}

joystickLeft.on('end', function(evt, data) {
    // Executes when joystick is released

    // Set values to zero
    exCharVal[output.throttle] = 0;
    exCharVal[output.yawRight] = 0;
    exCharVal[output.yawLeft] = 0;

    // Try to send data
    if(writePermission) {

        // Setting motor values to zero, repeat until successful
        exWrite('reset')
        .then(response => {
            console.log('Quadcopter stopped: ', response)
        })
        .catch(response => {
            console.log('Stopping failed: ', response);
            console.log('Retrying...');
            exWrite('reset');
        });
    } else {
        setTimeout( function() {
            exWrite('reset');
        }, 100);
    }
}).on('move', function(evt, data) {

    // Executes on every new touch event from joystick

    // Throttle is scaled from 0 - 255 to fit into one byte in Uint8Array
    var throttle = parseInt(((data.distance * Math.sin(data.angle.radian) + 75) / joystickSize) * 255);

    // Yaw is defined in pixels, with the joystick offset of 75px taken into account
    // TODO - Make joystick size and offset part of the joystick objects?
    var yaw = data.distance * Math.cos(data.angle.radian) + 75;
    var yawRight = 0;
    var yawLeft = 0;
    var yawLimit = ((joystickSize / 2) / 100) * yawLimits;

    // When yawStabilize is TRUE, a vertical zone in the middle of
    // the left joystick will result in zero yaw
    if(yawStabilize) {

        // Checking if joystick is positioned outside lower and upper limits
        if(yaw <=  (joystickCenter - yawLimit)) {

            // Scale yaw values to the area outside limits
            yaw = ((joystickCenter - yawLimit - yaw) / (joystickCenter - yawLimit));
            yawDir = "left";
            yaw *= yawScale;
            yaw = parseInt(yaw);

            // Checking and applying yaw trim values
            // If the resulting yaw is negative, apply it to opposite side's output
            // and set this side's output to 0
            if(yawTrim) {
                yaw += yawTrimValue;
            }
            if(yaw < 0) {
                yawLeft = 0;
                yawRight = -1 * yaw;
            } else {
                yawLeft = yaw;
                yawRight = 0;
            }
        } else if(yaw >=  (joystickCenter + yawLimit)) {
            yaw = ((joystickCenter - yawLimit ) - (joystickSize - yaw)) / (joystickCenter - yawLimit);
            yawDir = "right";
            yaw *= yawScale;
            yaw = parseInt(yaw);
            if(yawTrim) {
                yaw -= yawTrimValue;
            }
            if(yaw < 0) {
                yaw = yawRight = 0;
                yawLeft = -1 * yaw;
            } else {
                yawRight = yaw;
                yawLeft = 0;
            }
        } else {
            if(yawTrimValue > 0) {
                yaw = yawLeft = yawTrimValue;
                yawRight = 0;
                yawDir = "left";
            } else if(yawTrimValue < 0) {
                yaw = yawRight = -1 * yawTrimValue;
                yawLeft = 0;
                yawDir = "right";
            } else {
                yaw = 0;
                yawDir = "";
            }
        }
    }

    // Storing and sending joystick data with the EX characteristic
    exCharVal[output.throttle] = parseInt(throttle);
    exCharVal[output.yawRight] = parseInt(yawRight);
    exCharVal[output.yawLeft] = parseInt(yawLeft);


    throttle = 100 * throttle / 255;

    // Try to send data
    if(writePermission) {
        exWrite();
    }

})

/** Joystick right  **/
var joystickRight = nipplejs.create({
    zone: document.getElementById('joystick-right'),
    mode: 'static',
    position: {right: '-40px', top: '40%'},
    color: 'rgba(196, 2, 2, 1)',
    size: 150,
    restOpacity: 0.9
});

joystickRightPos = joystickRight.position;

joystickRight.on('end', function(evt, data) {

    // Set values to zero
    exCharVal[output.rollRight] = 0;
    exCharVal[output.rollLeft] = 0;
    exCharVal[output.pitchForward] = 0;
    exCharVal[output.pitchBackward] = 0;

    // Try to send data
    if(writePermission) {
        exWrite();
    }

    // console.log(exCharVal);

    if(printPosition) {
        select('#debug-pitchRight').innerHTML = '<b>Pitch</b>: 0';
        select('#debug-rollRight').innerHTML = '<b>Roll</b>: 0';
        //console.log(data);
    }
}).on('move', function(evt, data) {

    // Executes on every new touch event from joystick
    var pitch = ((data.distance * Math.sin(data.angle.radian) + 75) / joystickSize) * 100;
    var roll = ((data.distance * Math.cos(data.angle.radian) + 75) / joystickSize) * 100;
    var rollRight = 0;
    var rollLeft = 0;
    var pitchForward = 0;
    var pitchBackward = 0;

    if(roll < 50){
        roll = maxRoll * (50 - roll) / 50;
        rollDir = "left";
        rollLeft = roll;
    } else if(roll > 50) {
        roll = maxRoll * (roll - 50) / 50;
        rollDir = "right";
        rollRight = roll;
    }

    if(pitch < 50){
        pitch = maxPitch * (50 - pitch) / 50;
        pitchDir = "backward";
        pitchBackward = pitch;
    } else if(pitch > 50) {
        pitch = maxPitch * (pitch - 50) / 50;
        pitchDir = "forward";
        pitchForward = pitch;
    }

    // Storing and sending joystick data with the EX characteristic
    exCharVal[output.rollRight] = parseInt(rollRight);
    exCharVal[output.rollLeft] = parseInt(rollLeft);
    exCharVal[output.pitchForward] = parseInt(pitchForward);
    exCharVal[output.pitchBackward] = parseInt(pitchBackward);

    // Try to send data
    if(writePermission) {
        exWrite();
    }


    // Debug
    if(printPosition) {
        select('#debug-pitchRight').innerHTML = '<b>Pitch</b>: ' + pitch.toFixed(0) + '&deg; '+ pitchDir;
        select('#debug-rollRight').innerHTML = '<b>Roll</b>: ' + roll.toFixed(0)  + '&deg; ' + rollDir;
        //console.log(data);
    }
})




// Function to write to the EX characteristic
function exWrite(type = 'normal') {
    if(type == 'reset')
        exCharVal[output.throttle] = 0;

    return writeArrayToChar(txChar, exCharVal)
    .then( response => {
        // response holds the returned promise
    });
}


// END of joystick
