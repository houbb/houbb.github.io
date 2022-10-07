/**
 * 子类 Bullet 子弹类
 * @param opts
 * @constructor
 */
var Bullet = function (opts) {
    var opts = opts || {};
    Element.call(this, opts);
    this.icon = opts.icon;
};

//继承Element的方法
Bullet.prototype = new Element();

/**
 * 子弹向上射击
 * @returns {Bullet}
 */
Bullet.prototype.fly = function () {
    this.move(0, -this.speed);
    return this;
};

/**
 * 是否碰撞
 * @param target 目标元素对象
 */
Bullet.prototype.hasCrash = function (target) {
    var crash = false;
    //判断四边是否都没有空隙
    if (!(this.x + this.width < target.x) &&
        !(target.x + target.width < this.x) &&
        !(this.y + this.height < target.y) &&
        !(target.y + target.height < this.y)) {
        crash = true;
    }
    return crash;
};

/**
 * 绘制子弹
 * @returns {Bullet}
 */
Bullet.prototype.draw = function () {
    //绘画一个线条
    context.drawImage(this.icon, this.x, this.y, this.width, this.height);
    return this;
};