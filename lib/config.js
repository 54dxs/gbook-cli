var path = require('path');
var fs = require('fs-extra');// fs-extra模块是系统fs模块的扩展
var color = require('bash-color');
var userHome = require('user-home');// 得到用户主目录路径(C:\Users\lijian)

// 先从命令行参数获取是否指定了gbook_dir目录，如果没有则设置在默认用户主目录
var CONFIG_ROOT = process.env.GBOOK_DIR;
if (!CONFIG_ROOT) {
    if (!userHome) {
        console.log(color.red('需要定义HOME或GBOOK_DIR'));
        process.exit(1);
    }

    CONFIG_ROOT = path.resolve(userHome, '.gbook');
}
var VERSIONS_ROOT = path.resolve(CONFIG_ROOT, 'versions');
// CONFIG_ROOT = C:\Users\lijian\.gbook
// VERSIONS_ROOT = C:\Users\lijian\.gbook\versions

// 初始化并准备gbook-cli的配置
// 它创建所需的文件夹
function init() {
    fs.mkdirsSync(CONFIG_ROOT);
    fs.mkdirsSync(VERSIONS_ROOT);
}

// 替换要使用的根文件夹
function setRoot(root) {
    CONFIG_ROOT = path.resolve(root);
    VERSIONS_ROOT = path.resolve(CONFIG_ROOT, 'versions');

    module.exports.ROOT = CONFIG_ROOT;
    module.exports.VERSIONS_ROOT = VERSIONS_ROOT;
}

module.exports = {
    init: init,
    setRoot: setRoot,

    GBOOK_VERSION: '>0.x.x',
    ROOT: CONFIG_ROOT,
    VERSIONS_ROOT: VERSIONS_ROOT
};
