///////////////////////
// Various utilities //
///////////////////////

// Generate lpf closures
function lpfFactory(response) {
    var filterState = 0;

    var lpf = function(input) {
        filterState = response * filterState + (1 - response) * input;
        return filterState;
    };
    return lpf;
};


// implement range(), python style
function range(start,end,stepsize) {
    if(!stepsize) stepsize = 1;
    if(!end) {
       end = start;
       start = 0;
    }
    var newArray = [];
    for (i=0; i<(end - start)/stepsize; i++) {
        newArray[i] = start + i*stepsize;
    }
    return newArray;
};


// As in Haskell: zipWith ($) funclist arglist
function zipWithApply(funclist, arglist) {
    // Maybe yse 'apply' to extend this to arbitrary length arg lists
    var outlist = [];
    for (i=0; i<funclist.length; i++) {
        outlist[i] = funclist[i](arglist[i]);
    }
    return outlist;
};


function not(bool) {
    if (bool == true) {
        return false;
    } else {
        return true;
    }
};


function isNull(thing) {
    if (thing == null) {
        return true;
    } else {
        return false;
    }
};
