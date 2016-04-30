/**!
 * plugin-name  -version
 *
 * @use	    $("selector").pluginName();
 * @author  houbb
 * @time	2016-4-30 12:50:12
 */

;(function($, window, document, undefined) {
    //the default options;
    var defaults = {
    };

    //public methods;
    var methods = {
        init: function (options) {
            var options = $.extend({}, defaults, options);
        }
    };

    /**
     * The plugin is added to the jQuery library
     * @param {Object}/method options -  an object that holds some basic customization values ; method: method name;
     */
    $.fn.pluginName = function (method) {
        var method = arguments[0];
        if (methods[method]) {
            method = methods[method];
            arguments = Array.prototype.slice.call(arguments, 1);
        } else if (typeof method == "object" || !method) {
            method = methods.init;
        } else {
            $.error("Not find method " + method + " in plugin!");
            return this;
        }
        return method.apply(this, arguments);  //execute the method;
    };
})(jQuery, window, document);

