/**
 * 游戏相关配置
 * @type {Object}
 */
var CONFIG = {
    score: {
        big: 50,
        small: 20
    },
    planeSize: {
        width: 70,
        height: 60
    },
    planeType: 'redPlaneIcon',
    bulletSize: {
        width: 20,
        height: 20
    },
    enemySpeed: 2,
    enemyMaxNum: 6,
    enemySmallSize: {
        width: 54,
        height: 40
    },
    enemyBigSize: {
        width: 130,
        height: 100
    },
    bulletSpeed: 10,
    resources: {
        images: [
            {
                src: './img/plane@01.png',
                name: 'bluePlaneIcon'
            },
            {
                src: './img/plane@02.png',
                name: 'redPlaneIcon'
            },
            {
                src: './img/bullet.png',
                name: 'bulletIcon'
            },
            {
                src: './img/enemy@big.png',
                name: 'enemyBigIcon'
            },
            {
                src: './img/enemy@small.png',
                name: 'enemySmallIcon'
            },
            {
                src: './img/boom@big.png',
                name: 'enemyBoomBigIcon'
            },
            {
                src: './img/boom@small.png',
                name: 'enemyBoomSmallIcon'
            },
        ]
    }
}