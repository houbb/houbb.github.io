/**
 * 父类：element 对象
 * @param opts 实例化元素类时传入的参数
 * @constructor
 */
var Element = function (opts) {
    var opts = opts || {};
    //设置坐标和尺寸
    this.x = opts.x;
    this.y = opts.y;
    this.width = opts.width;
    this.height = opts.height;
    this.speed = opts.speed;
};

/**
 * 子弹对象原型
 * @type {{move: Element.move, draw: Element.draw}}
 */
Element.prototype = {
    /**
     * 原型方法 move
     * @param x
     * @param y
     */
    move: function (x, y) {
        var addX = x || 0;
        var addY = y || 0;
        this.x += x;
        this.y += y;
    },
    /**
     * 绘制方法
     * 子类继承实现
     */
    draw: function () {

    }
};