/**!
 * plugin-name  -version
 *
 * @use	    $("selector").my2048();
 * @author  houbb
 * @time	2016-4-30 12:50:12
 */

;(function($, window, document, undefined) {
    var SIZE = 4;       //the size of table;
    var SCORE = 0;      //the score counter;

    var DEFAULT_CSS = {
        table: 'my2048-table',
        td: 'my2048-table-td',
        restart: 'my2048-restart',
        score: 'my2048-score',
        infoWarp: 'my2048-info-warp'
    };
    var DEFAULT_BG_COLOR = {
        text: '#FFF',
        text2: 'wheat',
        text4: 'orange',
        text8: 'gold',
        text16: 'pink',
        text32: 'thistle',
        text64: 'coral',
        text128: 'lightblue',
        text256: 'skyblue',
        text512: 'deepskyblue',
        text1024: '#0066FF',
        text2048: 'firebrick',
        text4096: '#0099FF'
    };
    var KEYCODE = {
        LEFT_ARROW: 37,
        UP_ARROW: 38,
        RIGHT_ARROW: 39,
        DOWN_ARROW: 40,
        W: 87,
        S: 83,
        A: 65,
        D: 68
    };

    //the default options;
    var defaults = {
    };

    /**
     * @param $this the 2048 table;
     */
    var initClass = function($this) {
        $this.addClass(DEFAULT_CSS.table);
        $this.find('td').addClass(DEFAULT_CSS.td);
        $this.find("tr").each(function(i, tr) {
            var $tr = $(tr);
            $tr.find('td').each(function(j, td) {
                $(td).addClass(DEFAULT_CSS.td+i+j);
            });
        });
    };
    /**
     *
     */
    var initNumber = function() {
        var limit = 2;
        for(var i = 0; i < limit; i++) {
            methods.insertNumber();
        }
    };
    /**
     * init the bg color
     */
    var initBgColor = function() {
        $('.'+DEFAULT_CSS.td).each(function(i,e) {
            var $e = $(e);
            var newText = "text"+$e.text();
            var color = DEFAULT_BG_COLOR[newText];
            $e.css('background-color', color);
        });
    };

    var initKeyPress = function() {
        $(document).on('keydown', function(event) {
            var typecode = enterCode(event);

            if(KEYCODE.LEFT_ARROW == typecode || KEYCODE.A == typecode) {
                methods.moveLeft();
            } else if(KEYCODE.UP_ARROW == typecode || KEYCODE.W == typecode) {
                methods.moveUp();
            } else if(KEYCODE.RIGHT_ARROW == typecode || KEYCODE.D == typecode) {
                methods.moveRight();
            } else if(KEYCODE.DOWN_ARROW == typecode || KEYCODE.S == typecode) {
                methods.moveDown();
            }
        });
    };

    /**
     * get the enter code;
     * @param event
     * @returns {Number|Object|string}
     */
    var enterCode = function(event) {
        var theEvent = event || window.event;
        return theEvent.keyCode || theEvent.which || theEvent.charCode;
    };

    var hasMove = false;    //is has move flag;
    var pushLeft = function() {
        for(var i = 0; i < SIZE; i++){
            for(var j = 0; j < SIZE; j++){
                if(methods.isExistsNumber(i, j)){
                    var t = j;
                    while( t > 0 && !methods.isExistsNumber(i, t-1) ){
                        var oldText= $("."+DEFAULT_CSS.td+i+t).text();
                        $("."+DEFAULT_CSS.td+i+t).text('');
                        $("."+DEFAULT_CSS.td+i+(t-1)).text(oldText);
                        t--;
                        hasMove = true;
                    }
                }
            }
        }
    };
    var pushUp = function() {
        for(var i = 0; i < SIZE; i++){
            for(var j = 0; j < SIZE; j++){
                if(methods.isExistsNumber(i, j)){
                    var t = i;
                    while(t > 0 && !methods.isExistsNumber(t-1, j) ){
                        var oldText= $("."+DEFAULT_CSS.td+t+j).text();
                        $("."+DEFAULT_CSS.td+t+j).text('');
                        $("."+DEFAULT_CSS.td+(t-1)+j).text(oldText);
                        t--;
                        hasMove = true;
                    }
                }
            }
        }
    };
    var pushRight = function() {
        for(var i = 0; i < SIZE; i++){
            for(var j = 0; j < SIZE; j++){
                if(methods.isExistsNumber(i, j)){
                    var t = j;
                    while( t < (SIZE-1) && !methods.isExistsNumber(i, t+1) ){
                        var oldText= $("."+DEFAULT_CSS.td+i+t).text();
                        $("."+DEFAULT_CSS.td+i+t).text('');
                        $("."+DEFAULT_CSS.td+i+(t+1)).text(oldText);
                        t++;
                        hasMove = true;
                    }
                }
            }
        }
    };
    var pushDown = function() {
        for(var i = 0; i < SIZE; i++){
            for(var j = 0; j < SIZE; j++){
                if(methods.isExistsNumber(i, j)){
                    var t = i;
                    while(t < (SIZE-1) && !methods.isExistsNumber(t+1, j) ){
                        var oldText= $("."+DEFAULT_CSS.td+t+j).text();
                        $("."+DEFAULT_CSS.td+t+j).text('');
                        $("."+DEFAULT_CSS.td+(t+1)+j).text(oldText);
                        t++;
                        hasMove = true;
                    }
                }
            }
        }
    };

    var initRestartAndScore = function($this) {
        var warpHTML = "<div class='col-xs-12'></div>";
        var $warp = $(warpHTML).addClass(DEFAULT_CSS.infoWarp);

        var scoreHTML = '<label class="badge-yellow arrowed" title="W A S D">Total: <span class="value">'+SCORE+'</span></label>';
        var $score = $(scoreHTML).addClass(DEFAULT_CSS.score);
        var restartBtnHTML = '<button class="btn btn-define" title="W A S D"><i class="fa fa-fw fa-refresh"></i>Restart</button>';
        var $restart = $(restartBtnHTML).addClass(DEFAULT_CSS.restart);
        $restart.on('click', function () {
            methods.restart();
        });

        $this.after($restart);
        $('.'+DEFAULT_CSS.restart).wrap($warp);
        $restart.after($score);
    };
    //public methods;
    var methods = {
        init: function (options) {
            var options = $.extend({}, defaults, options);
            var $this = $(this);    //the 2048 table

            initClass($this);
            initKeyPress();
            methods.restart();

            //add restart and score
            initRestartAndScore($this);
            $this.show();
        },

        restart: function() {
            methods.clearNum();
            initNumber();
            initBgColor();
            SCORE = 0;
            $('.'+DEFAULT_CSS.score).find('.value').text(SCORE);
        },
        /**
         * clear all number in the table;
         */
        clearNum: function($this) {
            $this = $this || $('.'+DEFAULT_CSS.table);
            $this.find('.'+DEFAULT_CSS.td).text('');
        },
        /**
         * get randome number 0-3
         * @returns {number}
         */
        getRandIndex: function() {
            var num = Math.floor(Math.random()*100);
            return num % 4;
        },
        /**
         * get a random num 4/2
         * @returns {number}
         */
        getRandNum: function() {
            var num = Math.floor(Math.random()*100);
            return num > 90 ? 4 : 2;
        },
        /**
         * adjust current box weather has number?
         * @param i
         * @param j
         */
        isExistsNumber: function(i, j) {
            return $('.'+DEFAULT_CSS.td+i+j).text() != "";
        },
        /**
         * has blank box
         * @returns {boolean}
         */
        isExistsBlank: function() {
            var flag = false;
            $('.'+DEFAULT_CSS.td).each(function(i, e) {
                var text = $(e).text();
                if("" == text) {
                    flag = true;
                    return false;
                }
            });
            //return false：'break')。
            //return true：'continue'。
            return flag;
        },
        /**
         * insert a number
         */
        insertNumber: function() {
            var i = methods.getRandIndex();
            var j = methods.getRandIndex();
            while(methods.isExistsNumber(i, j)){
                i = methods.getRandIndex();
                j = methods.getRandIndex();
            }
            var randNumber = methods.getRandNum();
            $('.'+DEFAULT_CSS.td+i+j).text(randNumber);
            return this;
        },
        score: function() {
            return SCORE;;
        },
        /**
         *
         */
        moveLeft: function() {
            hasMove = false;
            pushLeft();
            for(var i = 0; i < SIZE; i++){
                for(var j = 0; j < SIZE; j++){
                    if( methods.isExistsNumber(i, j) && j < (SIZE-1)){
                        if( methods.isExistsNumber(i, j+1) && $("."+DEFAULT_CSS.td+i+j).text() == $("."+DEFAULT_CSS.td+i+(j+1)).text() ){
                            $("."+DEFAULT_CSS.td+i+j).text($("."+DEFAULT_CSS.td+i+j).text()*2);
                            $("."+DEFAULT_CSS.td+i+(j+1)).text("");
                            SCORE += $("."+DEFAULT_CSS.td+i+j).text()*1;
                        }
                    }
                }
            }
            pushLeft();
            if(hasMove){
                methods.insertNumber();
            }
            $('.'+DEFAULT_CSS.score).find('.value').text(SCORE);
            initBgColor();
        },
        /**
         *
         */
        moveUp: function() {
            hasMove = false;
            pushUp();
            var size = 4;
            for(var j = 0; j < 4; j++){
                for(var i = 0; i < 4; i++){
                    if( methods.isExistsNumber(i, j) && i < 3){
                        if( methods.isExistsNumber(i+1, j) && $("."+DEFAULT_CSS.td+i+j).text() == $("."+DEFAULT_CSS.td+(i+1)+j).text() ){
                            $("."+DEFAULT_CSS.td+i+j).text($("."+DEFAULT_CSS.td+i+j).text()*2);
                            $("."+DEFAULT_CSS.td+(i+1)+j).text("");
                            SCORE += $("."+DEFAULT_CSS.td+i+j).text()*1;
                        }
                    }
                }
            }
            pushUp();
            if(hasMove){
                methods.insertNumber();
            }
            $('.'+DEFAULT_CSS.score).find('.value').text(SCORE);
            initBgColor();
        },
        moveRight: function() {
            hasMove = 0;
            pushRight();
            for(var i = 0; i < 4; i++){
                for(var j = 3; j > 0; j--){
                    if( methods.isExistsNumber(i, j) && j > 0){
                        if( methods.isExistsNumber(i, j-1) && $("."+DEFAULT_CSS.td+i+j).text() == $("."+DEFAULT_CSS.td+i+(j-1)).text() ){
                            $("."+DEFAULT_CSS.td+i+j).text($("."+DEFAULT_CSS.td+i+j).text()*2);
                            $("#t"+i+(j-1)).text("");
                            SCORE += $("."+DEFAULT_CSS.td+i+j).text()*1;
                        }
                    }
                }
            }
            pushRight();
            if(hasMove){
                methods.insertNumber();
            }
            $('.'+DEFAULT_CSS.score).find('.value').text(SCORE);
            initBgColor();
        },
        moveDown: function() {
            hasMove = 0;
            pushDown();
            var size = 4;
            for(var j = 0; j < 4; j++){
                for(var i = (size-1); i >= 1; i--){
                    if( methods.isExistsNumber(i, j) && i > 0){
                        if( methods.isExistsNumber(i-1, j) && $("."+DEFAULT_CSS.td+i+j).text() == $("."+DEFAULT_CSS.td+(i-1)+j).text() ){
                            $("."+DEFAULT_CSS.td+i+j).text($("."+DEFAULT_CSS.td+i+j).text()*2);
                            $("."+DEFAULT_CSS.td+(i-1)+j).text("");
                            SCORE += $("."+DEFAULT_CSS.td+i+j).text()*1;
                        }
                    }
                }
            }

            pushDown();
            if(hasMove){
                methods.insertNumber();
            }
            $('.'+DEFAULT_CSS.score).find('.value').text(SCORE);
            initBgColor();
        }
    };

    /**
     * The plugin is added to the jQuery library
     * @param {Object}/method options -  an object that holds some basic customization values ; method: method name;
     */
    $.fn.my2048 = function (method) {
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

