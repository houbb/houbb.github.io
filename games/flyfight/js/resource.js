/**
 * 资源管理器
 * @type {{}}
 */
var resourceHelper = {
    /**
     * 加载图片
     * @param src
     * @param callback
     * @returns {HTMLImageElement}
     */
    imageLoader: function (src, callback) {
        var image = new Image();
        //图片加载完成
        image.addEventListener('load', callback);
        image.addEventListener('error', function () {
            console.log('imageError');
        });
        image.src = src;
        return image;
    },
    /**
     * 根据名称返回图片对象
     * @param imageName
     * @returns {*}
     */
    getImage: function (imageName) {
        return this.resources.images[imageName];
    },
    /**
     * 资源加载
     * @param {Array} resources 资源列表
     * @param callback
     */
    load: function (resources, callback) {
        var images = resources.images;
        var sounds = resources.sounds;
        var total = images.length;
        var finish = 0; //已完成的个数
        //保存加载后的图片对象和声音对象
        this.resources = {
            images: {},
            sounds: {}
        };
        var self = this;
        //遍历加载图片
        for (var i = 0; i < images.length; i++) {
            var name = images[i].name;
            var src = images[i].src;
            self.resources.images[name] = self.imageLoader(src, function () {
                finish++;
                if (finish == total) {
                    //全部加载完成
                    callback(self.resources);
                }
            });
        }
    }
};