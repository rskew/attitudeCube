/////////////////////////////
// Vector helper functions //
/////////////////////////////
// Requires utils.js

function Vector(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
};


function v_cross(v1,v2) {
    return new Vector(v1.y * v2.z - v1.z * v2.y,
                      v1.z * v2.x - v1.x * v2.z,
                      v1.x * v2.y - v1.y * v2.x);
};


function v_dot(v1,v2) {
        return (v1.x * v2.x + v1.y * v2.y + v1.z * v2.z);
};


function v_norm(v) {
        return Math.sqrt(Math.pow(v.x,2) + Math.pow(v.y,2) + Math.pow(v.z,2));
};


function v_unit(v) {
        var norm = v_norm(v);
        return new Vector(v.x/norm, v.y/norm, v.z/norm);
};


function v_minus(v1,v2) {
        return new Vector(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
};


function v_add(v1,v2) {
    return new Vector(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
};


function v_neg(v) {
        return new Vector(-v.x, -v.y, -v.z);
};


function v_toArray(v) {
    return [v.x, v.y, v.z];
};


function v_fromArray(list) {
    return new Vector(list[0], list[1], list[2]);
};


function v_angle_alt(v1,v2) {
        // Implementation from:
        //   http://www.plunk.org/~hatch/rightway.php
        var v1_ = v_unit(v1);
        var v2_ = v_unit(v2);
        if (v_dot(v1_,v2_) < 0.0) {
                return Math.PI - 2*Math.asin(v_norm(v_minus(v_neg(v1_),v2_))/2);
        } else {
                return 2*Math.asin( v_norm( v_minus(v1_,v2_) )/2.0 );
        }
};


function v_angle(v1,v2) {
    //return 2*Math.atan2(v_norm(v_cross(v1,v2)), v_dot(v1,v2));
    return Math.atan2(v_norm(v_cross(v1,v2)), v_dot(v1,v2));
};


function v_lpfFactory(response) {
    // Return a Low Pass Filter closure.
    //  wraps up 3 lpfs into a vector lpf

    //var filters = range(3).map(_ => lpfFactory(response));
    // Hack for old ios safari, no lambdas:
    var returnLpf = function(x) {
        return lpfFactory(response);
    };
    var filters = range(3).map(returnLpf);

    var v_lpf = function(v) {
        var smooth = zipWithApply(filters, v_toArray(v));
        return v_fromArray(smooth);
    };

    return v_lpf;
};


function v_eq(v1,v2) {
    var eps = 1e-5;
    return Math.abs(v1.x - v2.x) < eps  &&
           Math.abs(v1.y - v2.y) < eps  &&
           Math.abs(v1.z - v2.z) < eps;
};
