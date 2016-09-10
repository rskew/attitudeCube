/////////////////////////////////
// Quaternion helper functions //
/////////////////////////////////
// Requires vectors.js

function Quaternion(s, a, b, c) {
        this.s = s;
        this.a = a;
        this.b = b;
        this.c = c;
};


function q_rotator(theta, vector) {
        // Check for bad inputs
        if (theta == 0 ||
                vector.x == 0 &&
                vector.y == 0 &&
                vector.z == 0) {
            return new Quaternion(1,0,0,0);
        }

        var c = Math.cos(theta/2);
        var s = Math.sin(theta/2);
        // Normalize vector
        var norm = v_norm(vector);
        return new Quaternion(c,
                              s * vector.x / norm,
                              s * vector.y / norm,
                              s * vector.z / norm);
};


function q_fromVector(vec) {
        return new Quaternion(0,
                              vec.x,
                              vec.y,
                              vec.z);
};


function q_toVector(q) {
        return new Vector(q.a,
                          q.b,
                          q.c);
};


function q_conj(q) {
        return new Quaternion(q.s,
                              -q.a,
                              -q.b,
                              -q.c);
};


function q_mult(q1,q2) {
        // Scalar part: s1*s2 - dot(v1,v2)
        // Vector part: s1*v2 + s2*v1 + cross(v1,v2)
        return new Quaternion(q1.s * q2.s - (q1.a * q2.a + q1.b * q2.b + q1.c * q2.c),
                              q1.s * q2.a + q2.s * q1.a + q1.b * q2.c - q1.c * q2.b,
                              q1.s * q2.b + q2.s * q1.b + q1.c * q2.a - q1.a * q2.c,
                              q1.s * q2.c + q2.s * q1.c + q1.a * q2.b - q1.b * q2.a);
};

function q_normalize(q) {
        // This giving weird results
        var norm = Math.sqrt(Math.pow(q.s,2) +
                             Math.pow(q.a,2) +
                             Math.pow(q.b,2) +
                             Math.pow(q.c,2));
        return new Quaternion(q.s/norm,
                              q.a/norm,
                              q.b/norm,
                              q.c/norm);
};


function q_dot(q1,q2) {
    return q1.s*q2.s + q1.a*q2.a + q1.b*q2.b + q1.c*q2.c;
};


function q_neg(q) {
    return new Quaternion(-q.s, -q.a, -q.b, -q.c);
};


////////// Additions to vectors.js

function v_rotate(v, q) {
        var v_q = q_fromVector(v);
        return q_toVector(q_mult(q_mult(q, v_q),q_conj(q)));
};
