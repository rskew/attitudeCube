//////////////////////////////////////////////////////////
// Cube that rotates in response to sensor readings //////
//////////////////////////////////////////////////////////
// Requires utils.js
//          vectors.js
//          quaternions.js

//// Initialise variables

var x_axis = new Vector(1,0,0);
var y_axis = new Vector(0,1,0);
var z_axis = new Vector(0,0,1);

// Gravity vector in intertial frame
//   (earth fixed frame for this case)
var grav_v_I = new Vector(0,0,-1);
// Gravity vector in cube's Body frame
var grav_v_B = new Vector(0,0,-1);

var accel_v_B = new Vector(0,0,-1);
var v_smoothAccel = v_lpfFactory(0.0);

var gyro = {alpha: 0, beta: 0, gamma:0};
var gyroSum = {alpha: 0, beta: 0, gamma:0};

var hasSensors = false;

var north_v_I = new Vector(0,1,0);
var heading_I = 0;

var delta_t = 0.05;
var timeLpf = lpfFactory(0.9);

// Cube orientation is defined as a quaternion that rotates
//  a vector from the body frame to the inertial frame
var state_q = new Quaternion(1,0,0,0);
 
// cubeVecs holds the vectors representing the vertices of the cube
var cubeVecs = [];
function initCubeVecs() {
    cubeVecs[0] = new Vector(-1,-1,-1);
    cubeVecs[1] = new Vector(1,-1,-1);
    cubeVecs[2] = new Vector(1,1,-1);
    cubeVecs[3] = new Vector(-1,1,-1);
    cubeVecs[4] = new Vector(-1,-1,1);
    cubeVecs[5] = new Vector(1,-1,1);
    cubeVecs[6] = new Vector(1,1,1);
    cubeVecs[7] = new Vector(-1,1,1);
};


//// Variables for screensaver cube
var axis_v = new Vector(4,2,1);
var metaAxis_v = new Vector(1,1,1);
var metaMetaAxis_v = new Vector(-1,1,0);

var metaMetaSpeed = 0.0003;
var metaSpeed = 0.002;
var speed = 0.002;

var metaMetaRotator_q = q_rotator(metaMetaSpeed, metaMetaAxis_v);


//// Setup window size
var width = window.innerWidth
|| document.documentElement.clientWidth
|| document.body.clientWidth;

var height = window.innerHeight
|| document.documentElement.clientHeight
|| document.body.clientHeight;

var svg = document.getElementById('svg0');

var svgDim = Math.min(height,width);
svg.setAttribute("height", height);
svg.setAttribute("width", width);

var cubeMargin = 0.8;
var cubeDim = svgDim * cubeMargin / (Math.sqrt(3) * 2.0);

var cubeScaleX = cubeDim;
var cubeScaleY = -cubeDim; // Y axis inverted to compensate for y-down canvas convention
var cubeOffsetX = width / 2.0;
var cubeOffsetY = height / 2.0;

//// Read sensor values

function handleMotionEvent(e) {
    accel_v_B = v_smoothAccel(e.accelerationIncludingGravity);

    gyro.alpha = e.rotationRate.alpha;
    gyro.beta = e.rotationRate.beta;
    gyro.gamma = e.rotationRate.gamma;

    gyroSum.alpha += gyro.alpha
    gyroSum.beta += gyro.beta
    gyroSum.gamma += gyro.gamma

    delta_t = timeLpf(e.interval);

    // Check if device actually has sensors
    hasSensors = not(isNull(gyro.alpha));
};


function handleCompassEvent(e) {
    heading_I = e.webkitCompassHeading;
};
 


//// Display sensor data
 
function repeat(str, num) { 
        return (new Array(num+1)).join(str); 
};


function showData(d){
    var offset = 20;
    var str = "*";
    var n = Math.floor(d);
    var spaces = Math.min(offset,offset+n);
    var fill = offset - spaces;
    var stars = Math.max(0,n);
    return repeat("_",spaces) + repeat("*",fill+stars) + repeat("_",offset - stars);
};


function printData() {
    if (not(hasSensors)) {
        var el = document.getElementById( 'SensorReadings' );
        //if (el) {
        el.style.display = "none";
        //el.parentNode.removeChild( el );
        //}
        return;
    } else {
        var el = document.getElementById( 'SensorReadings' );
        el.style.display = "block";
    }

    document.getElementById("accel_x").innerHTML = showData(accel_v_B.x);
    document.getElementById("accel_y").innerHTML = showData(accel_v_B.y);
    document.getElementById("accel_z").innerHTML = showData(accel_v_B.z);

    var gyroScaleVis = 20;
    document.getElementById("gyro_alpha").innerHTML = showData(gyro.alpha/gyroScaleVis);
    document.getElementById("gyro_beta").innerHTML = showData(gyro.beta/gyroScaleVis);
    document.getElementById("gyro_gamma").innerHTML = showData(gyro.gamma/gyroScaleVis);

    var compassScaleVis = 10;
    document.getElementById("compass_x").innerHTML = showData(heading_v_I.x * compassScaleVis);
    document.getElementById("compass_y").innerHTML = showData(heading_v_I.y * compassScaleVis);
};


//////////////////
// Draw Cube /////
//////////////////

function rotateCube() {
        // Initialise the corner vectors, then rotate them to
        //  the current orientation by conjugating them with the
        //  state quaternion

        initCubeVecs();

        for (i = 0; i < cubeVecs.length; i ++) {
                // Use the cojugate of q to display the cube
                //  oriented North East Down, viewed from the plane
                //  normal to the z axis of the body frame (ie the screen)
                newvec = v_rotate(cubeVecs[i], q_conj(state_q));
                cubeVecs[i].x = newvec.x;
                cubeVecs[i].y = newvec.y;
                cubeVecs[i].z = newvec.z;
        }
};


function v_toPolyString(vs) {
        var vecstringer = function(v) {
            var x = (v.x * cubeScaleX) + cubeOffsetX;
            var y = (v.y * cubeScaleY) + cubeOffsetY;
            return (x.toString() + "," + y.toString());
        };
        var vstrs = vs.map(vecstringer);
        return vstrs.join(" ");
};


//function redFront() {
//        var zAv = (cubeVecs[0].z + cubeVecs[1].z + cubeVecs[2].z + cubeVecs[3].z)/4.0;
//        return (zAv > 0);
//};


function isColour(colour) {
    return function _(line) {
        if (line.id.indexOf(colour) != -1) {
            return true;
        } else {
            return false;
        }
    }
};


function drawCube() {

        rotateCube();

        // Draw lines between vertices of cube,
        //  vertices given by the vectors in cubeVecs
        var lines = document.getElementsByTagName('line');
        var greenLines = nodeListToArray(lines).filter(isColour("green"));
        var blueLines = nodeListToArray(lines).filter(isColour("blue"));
        var redLines = nodeListToArray(lines).filter(isColour("red"));

        // Draw solid red face of cube
        var svg = document.getElementById('svg0');
        //var poly = document.getElementById('poly0');
        var junk1 = document.getElementById('junk1');
        var junk2 = document.getElementById('junk2');
        var line4 = document.getElementById('line4');


        //if (redFront()) {
        //        svg.insertBefore(poly,junk2);
        //        greenLines.map((function (line){
        //                            svg.insertBefore(line,junk1)
        //                        }), greenLines);
        //} else {
        //        svg.insertBefore(poly,junk1);
        //        greenLines.map((function (line){
        //                            svg.insertBefore(line,junk2)
        //                        }), greenLines);
        //}
        //var polyString = v_toPolyString([cubeVecs[0],cubeVecs[1],cubeVecs[2],cubeVecs[3]]);
        //poly.setAttribute("points", polyString);

        for (i = 0; i<4; i++){
            // Green Face
            greenLines[i].setAttribute("x1", cubeVecs[i+4].x * cubeScaleX + cubeOffsetX)
            greenLines[i].setAttribute("y1", cubeVecs[i+4].y * cubeScaleY + cubeOffsetY)
            greenLines[i].setAttribute("x2", cubeVecs[((i+1)%4)+4].x * cubeScaleX + cubeOffsetX)
            greenLines[i].setAttribute("y2", cubeVecs[((i+1)%4)+4].y * cubeScaleY + cubeOffsetY)

            // Blue Lines
            blueLines[i].setAttribute("x1", cubeVecs[i].x * cubeScaleX + cubeOffsetX)
            blueLines[i].setAttribute("y1", cubeVecs[i].y * cubeScaleY + cubeOffsetY)
            blueLines[i].setAttribute("x2", cubeVecs[i+4].x * cubeScaleX + cubeOffsetX)
            blueLines[i].setAttribute("y2", cubeVecs[i+4].y * cubeScaleY + cubeOffsetY)

            // Red Lines
            redLines[i].setAttribute("x1", cubeVecs[i].x * cubeScaleX + cubeOffsetX)
            redLines[i].setAttribute("y1", cubeVecs[i].y * cubeScaleY + cubeOffsetY)
            redLines[i].setAttribute("x2", cubeVecs[(i+1)%4].x * cubeScaleX + cubeOffsetX)
            redLines[i].setAttribute("y2", cubeVecs[(i+1)%4].y * cubeScaleY + cubeOffsetY)
        }

        //// Sensed Grav Vector
        //lines[8].setAttribute("x1", cubeOffsetX);
        //lines[8].setAttribute("y1", cubeOffsetY);
        //lines[8].setAttribute("x2", accel_v_I.x * cubeScaleX + cubeOffsetX);
        //lines[8].setAttribute("y2", accel_v_I.y * cubeScaleY + cubeOffsetY)

        //// Predicted grav vector from observed attitude state
        //lines[9].setAttribute("x1", cubeOffsetX)
        //lines[9].setAttribute("y1", cubeOffsetY)
        //var gravScale = 10;
        //lines[9].setAttribute("x2", grav_v_I.x * cubeScaleX * gravScale + cubeOffsetX)
        //lines[9].setAttribute("y2", grav_v_I.y * cubeScaleY * gravScale + cubeOffsetY)


        var el = document.getElementById( 'CubeSVG' );
        el.style.display = "block";
};


function debug(){
    document.getElementById("debug0").innerHTML = "heading_v_B.x: " + heading_v_B.x;
    document.getElementById("debug1").innerHTML = "heading_v_B.y: " + heading_v_B.y;

};

var axisdb = new Vector(0,0,0);
var accel_v_I = new Vector(0,0,-1);
var heading_v_I = new Vector(0,1,0);

function simpleFilter(state_q, gyroSum, accel_v_B, heading_I) {
        // Simply add up the accuulated rotations measured from the
        //  gyroscope, slowly slerping to the accelerometer and
        //  compass readings to compensate for drift.

        var degToRad = Math.PI / 180;

        // Alpha rotates around x axis
        var theta_a = gyroSum.alpha * degToRad * delta_t;
        var alpha_q = q_rotator(theta_a, x_axis);
        gyroSum.alpha = 0;

        // Alpha rotates around x axis
        var theta_b = gyroSum.beta * degToRad * delta_t;
        var beta_q = q_rotator(theta_b, y_axis);
        gyroSum.beta = 0;

        // Alpha rotates around x axis
        var theta_g = gyroSum.gamma * degToRad * delta_t;
        var gamma_q = q_rotator(theta_g, z_axis);
        gyroSum.gamma = 0;

        // Multiply quaternions to compose rotations!
        var gyro_q = q_mult( q_mult(alpha_q, beta_q), gamma_q);

        // Update system attitude state
        //state_q = q_mult(gyro_q, state_q);
        newState_q = q_mult(state_q, gyro_q);

        //// Slerp to accelerometer reading
        var slerpRate = 0.1;
        accel_v_I = v_rotate(accel_v_B, state_q);
        var theta = v_angle(accel_v_I, grav_v_I) * slerpRate;
        var axis_v = v_cross(accel_v_I, grav_v_I);
        var accelSlerp_q = q_rotator(theta, axis_v);
        newState_q = q_mult(accelSlerp_q, newState_q);

        // Slerp to compass reading
        var compassSlerpRate = 0.03;
        var degToRad = Math.PI / 180;
        heading_v_I.x = Math.sin(heading_I * degToRad);
        heading_v_I.y = Math.cos(heading_I * degToRad);
        headingPredicted_v_I = v_rotate(y_axis, state_q);
        var headingSlerpAxis_v = v_cross(headingPredicted_v_I, heading_v_I);
        var headingTheta = v_angle(headingPredicted_v_I, heading_v_I) * compassSlerpRate;
        headingSlerp_q = q_rotator(headingTheta, headingSlerpAxis_v);
        newState_q = q_mult(headingSlerp_q, newState_q);

        return newState_q;
};


function saverRotate(state_q) {
    metaAxis_v = v_rotate(metaAxis_v, metaMetaRotator_q);
    metaRotator_q = q_rotator(metaSpeed, metaAxis_v);
    axis_v = v_rotate(axis_v, metaRotator_q);
    rotator_q = q_rotator(speed, axis_v);
    newState_q = q_mult(rotator_q, state_q);
    return newState_q
};


function updateAttitude() {
    if (hasSensors) {
        state_q = simpleFilter(state_q, gyroSum, accel_v_B, heading_I);
    } else {
        state_q = saverRotate(state_q);
    }
};

printData();
window.setInterval(printData, 1);
window.addEventListener('devicemotion', handleMotionEvent, false);
window.addEventListener('deviceorientation', handleCompassEvent, false);
window.setInterval(drawCube, 2);
window.setInterval(updateAttitude, 5);
//window.setInterval(debug,20);

