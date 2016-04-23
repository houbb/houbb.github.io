/**
 * !
 * Created by houbb, All rights reserved.
 * @type {Base|*|{}}
 */

$(document).ready(function() {
    Base.initContentHeight();
    Base.select2Demo();

    //
    $('#colResizable').colResizable({
        liveDrag:true,
        gripInnerHtml:"<div class='grip'></div>",
        draggingClass:"dragging"
    });
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
     * select2 init
     */
    this.select2Demo = function() {
        $("select#index").select2();
        $("select#multi-index").select2();
        $("select#multi-index1").select2({});
        $("select#multi-index1").val(["home", "about"]).trigger("change");
    };

    /**
     * colResizable
     */
    $('#colResizable').colResizable({
        minWidth: 100
    });
};