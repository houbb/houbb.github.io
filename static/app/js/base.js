/**
 * !
 * Created by houbb, All rights reserved.
 * @type {Base|*|{}}
 */

$(document).ready(function() {
    Base.initContentHeight();
    if(!Util.isMobile()) {  //use scroll bar when is PC;
        Base.initBodyScrollBar();
    }

    //demo
    Base.select2Demo();
    Base.colResizable();
});

var Base = new Base();
function Base(){
    /**
     * init the content height
     */
    this.initContentHeight = function() {
        var content = $('.page-content');
        var headHeight = $('.site-header').height();
        var wh = Util.windowHeight();
        content.css('min-height', wh-headHeight);
    };
    /**
     * init body scroll bar
     */
    this.initBodyScrollBar = function() {
        $("body").mCustomScrollbar({
            //autoHideScrollbar:true,
            theme:"light-thick"
        });
        $("#back-to-top").on('click', function() {
            $("body").mCustomScrollbar("scrollTo", "top");
        });
    };

    /**
     * select2 init
     */
    this.select2Demo = function() {
        $("select#index").select2();
        $("select#multi-index").select2();
        $("select#multi-index1").select2({});
        $("select#multi-index1").val(["home", "about"]).trigger("change");
    };
    /**
     * colResizable init
     */
    this.colResizable = function() {
        $('#colResizable').colResizable({
            liveDrag:true,
            gripInnerHtml:"<div class='grip'></div>",
            draggingClass:"dragging",
            minWidth: 100
        });
    };
};