//常用的元素和变量
var $body = $(document.body);

//画布相关
var $canvas = $('#game');
var canvas = $canvas.get(0);
var context = canvas.getContext('2d');
//设置画布的宽度和高度
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
//获取画布相关信息
var canvasWidth = canvas.clientWidth;
var canvasHeight = canvas.clientHeight;

//判断是否有 requestAnimationFrame 方法 如果没有则模拟实现
window.requestAnimFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
        window.setTimeout(callback, 1000 / 30);
    };

/**
 * 事件绑定
 */
function bindEvent() {
    //绑定事件
    var self = this;
    //点击开始按钮
    $body.on('click', '.js-start', function () {
        $body.attr('data-status', 'start');
        //开始游戏
        GAME.start();
    });

    //点击说明按钮
    $body.on('click', '.js-rule', function () {
        $body.attr('data-status', 'rule');
    });

    //点击我知道了规则按钮
    $body.on('click', '.js-confirm-rule', function () {
        $body.attr('data-status', 'index');
    });

    //点击设置按钮
    $body.on('click', '.js-setting', function () {
        $body.attr('data-status', 'setting');
    });

    //点击确认设置按钮
    $body.on('click', '.js-confirm-setting', function () {
        $body.attr('data-status', 'index');
        var plane = $("#panle").val();
        //设置游戏
        GAME.init({planeType: plane});
    });

    //得分回到首页
    $body.on('click', '.comeback', function () {
        $body.attr('data-status', 'index');
    });

    //重新开始
    $body.on('click', '.js-reload', function () {
        $body.attr('data-status', 'start');
        //开始游戏
        GAME.start();
    });

    //背景选择
    $("#background").change(function () {
        var value = $(this).val();
        $body.removeClass().addClass(value)
    });

    //音乐选择
    $("#music").change(function () {
        var value = $(this).val();
        GAME.toggleMusic(value);
    });

}

/**
 * 游戏类
 * @type {{init: GAME.init, start: GAME.start, updateScore: GAME.updateScore, update: GAME.update, bindTouchAction: GAME.bindTouchAction, end: GAME.end, updateElement: GAME.updateElement, draw: GAME.draw, createEnemy: GAME.createEnemy}}
 */
var GAME = {
    /**
     * 游戏初始化
     * @params opts 参数
     */
    init: function (opts) {
        //设置参数
        opts = Object.assign(CONFIG, opts);
        this.opts = opts;
        this.score = 0;
        //计算飞机对象极限坐标
        this.planePosX = canvasWidth / 2 - opts.planeSize.width / 2;
        this.planePosY = canvasHeight - opts.planeSize.height - 50;
    },
    /**
     * 游戏开始需要设置
     */
    start: function () {
        //获取游戏初始化 level
        var self = this; //保存函数调用对象（GAME）
        var opts = this.opts;
        var images = this.images;
        //清空设计目标对象数组和分数设置为0
        this.enemies = [];
        this.score = 0;
        //随机生成大小敌机
        this.createSmallEnemyInterval = setInterval(function () {
            self.createEnemy('normal');
        }, 500);
        this.createBigEnemyInterval = setInterval(function () {
            self.createEnemy('big');
        }, 1500);
        //创建飞机
        this.plane = new Plane({
            x: this.planePosX,
            y: this.planePosY,
            width: opts.planeSize.width,
            height: opts.planeSize.height,
            bulletSize: opts.bulletSize,
            bulletSpeed: opts.bulletSpeed,
            icon: resourceHelper.getImage(opts.planeType),
            bulletIcon: resourceHelper.getImage('bulletIcon'),
            boomIcon: resourceHelper.getImage('enemyBoomBigIcon')
        });
        //飞机开始射击
        this.plane.startShoot();
        //开始更新游戏
        this.update();
    },
    /**
     * 更新当前所有元素的状态
     */
    updateElement: function () {
        var opts = this.opts;
        var enemySize = opts.enemySize;
        var plane = this.plane;
        var enemies = this.enemies;
        var i = enemies.length;
        //判断飞机状态
        if (plane.status === 'booming') {
            plane.booming();
            return;
        }
        //循环更新
        while (i--) {
            var enemy = enemies[i];
            enemy.down();
            if (enemy.y >= canvasHeight) {
                this.enemies.splice(i, 1);
            } else {
                //判读飞机状态
                if (plane.status === 'normal') {
                    if (plane.hasCrash(enemy)) {
                        plane.booming();
                    }
                }
                // 根据敌机状态判断是否被击中
                switch (enemy.status) {
                    case 'normal':
                        if (plane.hasHit(enemy)) {
                            enemy.live -= 1;
                            if (enemy.live === 0) {
                                if (enemy.type === 'big') {
                                    this.score += opts.score.big;
                                } else {
                                    this.score += opts.score.small;
                                }
                                enemy.booming();
                            }
                        }
                        break;
                    case 'booming':
                        enemy.booming();
                        break;
                    case 'boomed':
                        enemies.splice(i, 1);
                        break;
                }
            }
        }
    },
    /**
     * 绑定手指触摸
     */
    bindTouchAction: function () {
        var opts = this.opts;
        var self = this;
        //飞机极限横坐标、纵坐标
        var planeMinX = 0;
        var planeMinY = 0;
        var planeMaxX = canvasWidth - opts.planeSize.width;
        var planeMaxY = canvasHeight - opts.planeSize.height;
        //手指初始位置坐标
        var startTouchX;
        var startTouchY;
        //飞机初始位置
        var startPlaneX;
        var startPlaneY;
        //首次触屏
        $canvas.on('touchstart', function (e) {
            var plane = self.plane;
            //记录首次触摸位置
            startTouchX = e.touches[0].clientX;
            startTouchY = e.touches[0].clientY;
            startPlaneX = plane.x;
            startPlaneY = plane.y;
        });
        //滑动屏幕
        $canvas.on('touchmove', function (e) {
            var newTouchX = e.touches[0].clientX;
            var newTouchY = e.touches[0].clientY;
            //新的飞机坐标等于手指滑动的距离加上飞机初始位置
            var newPlaneX = startPlaneX + newTouchX - startTouchX;
            var newPlaneY = startPlaneY + newTouchY - startTouchY;
            //判断是否超出位置
            if (newPlaneX < planeMinX) {
                newPlaneX = planeMinX;
            }
            if (newPlaneX > planeMaxX) {
                newPlaneX = planeMaxX;
            }
            if (newPlaneY < planeMinY) {
                newPlaneY = planeMinY;
            }
            if (newPlaneY > planeMaxY) {
                newPlaneY = planeMaxY;
            }
            //更新飞机的位置
            self.plane.setPosition(newPlaneX, newPlaneY);
            //禁止默认事件，防止滚动屏幕
            e.preventDefault();
        });
    },
    /**
     * 更新画布
     */
    update: function () {
        var self = this;
        var opts = this.opts;
        //清理画布
        context.clearRect(0, 0, canvasWidth, canvasHeight);
        //更新飞机、敌人
        this.updateElement();
        //判断飞机是否爆炸
        if (this.plane.status === 'boomed') {
            this.end();
            return;
        }
        //绘制得分
        this.updateScore();
        //绘制画布
        this.draw();
        //不断循环 update
        requestAnimFrame(function () {
            self.update();
        });
    },
    /**
     * 生成敌机
     * @param enemyType 敌机类型
     */
    createEnemy: function (enemyType) {
        var enimes = this.enemies;
        var opts = this.opts;
        var images = this.images || {};
        var enemySize = opts.enemySmallSize;
        var enemySpeed = opts.enemySpeed;
        var enemyIcon = resourceHelper.getImage('enemySmallIcon');
        var enemyBoomIcon = resourceHelper.getImage('enemyBoomSmallIcon');
        var enemyLive = 1;
        //大型敌机参数
        if (enemyType === 'big') {
            enemySize = opts.enemyBigSize;
            enemyIcon = resourceHelper.getImage('enemyBigIcon');
            enemyBoomIcon = resourceHelper.getImage('enemyBoomBigIcon');
            enemySpeed = opts.enemySpeed * 0.6;
            enemyLive = 10;
        }
        //综合元素的参数
        var initOpt = {
            x: Math.floor(Math.random() * (canvasWidth - enemySize.width)),
            y: -enemySize.height,
            type: enemyType,
            live: enemyLive,
            width: enemySize.width,
            height: enemySize.height,
            speed: enemySpeed,
            icon: enemyIcon,
            boomIcon: enemyBoomIcon
        };
        //敌机的数量不大于最大值则新增
        if (enimes.length < opts.enemyMaxNum) {
            enimes.push(new Enemy(initOpt));
        }
    },
    end: function () {
        $("#score").text(this.score);
        $body.attr('data-status', 'score');
    },
    draw: function () {
        //绘制敌机
        this.enemies.forEach(function (enemy) {
            enemy.draw();
        });
        //绘制战斗机
        this.plane.draw();
    },
    /**
     * 绘制得分
     */
    updateScore: function () {
        context.fillStyle = "#fff";
        context.font = '20px "微软雅黑"';
        context.fillText(this.score, 20, 20);
    },
    /**
     * 切换背景音乐
     * @param type
     */
    toggleMusic: function (type) {
        var player = $("#bgm")[0];
        if (type === 'close') {
            player.pause();
        } else {
            player.play();
        }
    },

};

/**
 * 页面主入口
 */
function init() {
    //加载图片资源，加载完成才能交互
    resourceHelper.load(CONFIG.resources, function (resources) {
        //加载完成
        GAME.init();
        //绑定手指事件
        GAME.bindTouchAction();
        bindEvent();
    });
}

init();