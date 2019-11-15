var Q = require('q');// Q是nodeJs中实现promise的包之一，是nodeJs中比较常用的一个库。
var fs = require('fs-extra');
var path = require('path');
var _ = require('lodash');
var npmi = require('npmi');
var npm = require('npm');
var tmp = require('tmp');
var color = require('bash-color');
var parsedArgv = require('optimist').argv;

var config = require('./config');
var tags = require('./tags');

/**
 * 返回此系统上所有可用版本的列表
 * 读取`C:\Users\lijian\.gbook\versions`目录下的版本,并遍历严格校验版本信息package.json中的配置信息
 */
function listVersions() {
    var folders = fs.readdirSync(config.VERSIONS_ROOT);
    var latest = null;

    return _.chain(folders)
        .map(function(tag) {
            // Verison符合要求？
            if (!tags.isValid(tag)) return null;

            // 读取package.json以确定版本
            var versionFolder = path.resolve(config.VERSIONS_ROOT, tag);
            var stat = fs.lstatSync(versionFolder);
            var pkg;

            try {
                pkg = require(path.resolve(versionFolder, 'package.json'));
            } catch(e) {
                return null;
            }

            // Is it gbook?
            if (pkg.name != 'gbook') return null;

            return {
                // 文件夹中关联的名称
                name: tag,

                // 真正的绝对版本
                version: pkg.version,

                // 此版本的位置
                path: versionFolder,

                // 位置如果是符号链接
                link: stat.isSymbolicLink()? fs.readlinkSync(versionFolder) : null,

                // 发布类型、最新版本、测试版等？
                tag: tags.getTag(pkg.version)
            };
        })
        .compact()

        // 按版本排序
        .sort(function(a, b) {
            return tags.sort(a.version, b.version);
        })
        .value();
}

/**
 * 返回特定版本的路径
 * @param {Object} version
 */
function versionRoot(version) {
    return path.resolve(config.VERSIONS_ROOT, version);
}

/**
 * 使用条件解析版本
 * @param {Object} condition
 */
function resolveVersion(condition) {
    var versions = listVersions();
    var version = _.chain(versions)
        .find(function(v) {
            return tags.satisfies(v.name, condition);
        })
        .value();

    if (!version) return Q.reject(new Error('没有版本匹配: '+condition));
    return Q(version);
}

/**
 * 删除已安装版本的gbook
 * @param {Object} version
 */
function removeVersion(version) {
    if (!version) return Q.reject(new Error('未指定版本'));
    var outputFolder = versionRoot(version);

    return Q.nfcall(fs.lstat.bind(fs), outputFolder)
    .then(function(stat) {
        if (stat.isSymbolicLink()) {
            return Q.nfcall(fs.unlink.bind(fs), outputFolder);
        }
        return Q.nfcall(fs.remove.bind(fs), outputFolder);
    });
}

/**
 * 加载到gbook版本
 * @param {Object} version
 */
function loadVersion(version) {
    return Q(_.isString(version)? resolveVersion(version) : version)
    .then(function(resolved) {
        var gbook;

        try {
            gbook = require(resolved.path);
        } catch (err) {
            console.log(color.red('加载版本时出错 '+resolved.tag+': '+(err.stack || err.message || err)));
            return null;
        }

        if (!gbook) throw new Error('gbook 版本 '+resolved.tag+' 已损坏');
        return gbook;
    });
}

/**
 * 将文件夹链接到标记
 * @param {Object} name
 * @param {Object} folder
 */
function linkVersion(name, folder) {
    if (!name) return Q.reject(new Error('需要一个名称来表示这个gbook版本'));
    if (!folder) return Q.reject(new Error('需要文件夹'));
    var outputFolder = versionRoot(name);

    return Q.nfcall(fs.symlink.bind(fs), folder, outputFolder);
}

module.exports = {
    load: loadVersion,
    resolve: resolveVersion,
    versions: listVersions,
    remove: removeVersion,
    link: linkVersion
};
