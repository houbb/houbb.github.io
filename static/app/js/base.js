/**
 * !
 * Created by houbb, All rights reserved.
 * @type {Util|*|{}}
 */

$(document).ready(function() {
    Base.initContentHeight();
    Base.select2Demo();
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
};


//function initScrollBar() {
//    //var headHeight = $('.site-header').height();
//    var footHeight = $('.site-footer').height();
//    var contentMinHeight = $('.page-content').css('min-height');
//    var pageContentWarp = $('.page-body-warp');
//    pageContentWarp.css('height', footHeight+Util.getValPX(contentMinHeight)).css('overflow-y', 'auto');
//    pageContentWarp.perfectScrollbar({
//        swipePropagation: false
//    });
//}
