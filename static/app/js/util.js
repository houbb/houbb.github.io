/**
 * !
 * Created by houbb, All rights reserved.
 * This is a util js.
 * @type {Util|*|{}}
 */
var Util = Util || {};

/**
 * get thw window height dynamic.
 * @returns {Number|number}
 */
Util.windowHeight = function() {
    return window.innerHeight || document.documentElement.clientHeight;
};
/**
 * get the number value of width/height
 * @param val
 * @returns {*}
 */
Util.getValPX = function(val) {
    var PX = 'px';
    if(val.indexOf(PX) > -1) {
        return val.split(PX)[0];
    }
    return val;
};
