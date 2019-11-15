var Q = require('q');
var fs = require('fs-extra');
var npmi = require('npmi');
var npm = require('npm');
var tmp = require('tmp');
var _ = require('lodash');
var path = require('path');

var tags = require('./tags');
var config = require('./config');

/**
 * 使用前初始化NPM
 */
var initNPM = _.memoize(function() {
    return Q.nfcall(npm.load, {
        silent: true,
        loglevel: 'silent'
    });
});

/**
 * 返回注册表中可用版本的列表（npm）
 */
function availableVersions() {
    return initNPM()
    .then(function() {
        return Q.nfcall(npm.commands.view, ['gbook', 'versions', 'dist-tags'], true);
    })
    .then(function(result) {
        result = _.chain(result).values().first().value();
        result = {
            versions: _.chain(result.versions)
                .filter(function(v) {
                    return tags.isValid(v);
                })
                .sort(tags.sort)
                .value(),
            tags: _.chain(result['dist-tags'])
                .omit(function(tagVersion, tagName) {
                    return !tags.isValid(tagVersion);
                })
                .value()
        };

        if (result.versions.length == 0) throw new Error('NPM注册表上没有有效版本');
        return result;
    });
}

/**
 * 将version name或tag解析为可安装的绝对版本
 * @param {Object} version
 */
function resolveVersion(version) {
    var _version = version;

    return availableVersions()
    .then(function(available) {
        // 如果是tag解析
        if (available.tags[version]) version = available.tags[version];

        version = _.find(available.versions, function(v) {
            return tags.satisfies(v, version, {
                // 从npm dist-tags解析tag
                acceptTagCondition: false
            });
        });

        // 检查版本
        if (!version) throw new Error('无效的version或tag "'+_version+'", 使用"gbook ls-remote"查看');
        return version;
    });
}

/**
 * 安装特定版本的gbook
 * @param {Object} version
 * @param {Object} forceInstall
 */
function installVersion(version, forceInstall) {
    return resolveVersion(version)
    .then(function(_version) {
        version = _version;
        return Q.nfcall(tmp.dir.bind(tmp));
    })
    .spread(function(tmpDir) {
        var options = {
            name: 'gbook',
            version: version,
            path: tmpDir,
            forceInstall: !!forceInstall,
            npmLoad: {
                loglevel: 'silent',
                loaded: false,
                prefix: tmpDir
            }
        };
        console.log('正在安装gbook', version);
        return Q.nfcall(npmi.bind(npmi), options).thenResolve(tmpDir);
    })
    .then(function(tmpDir) {
        var gbookRoot = path.resolve(tmpDir, 'node_modules/gbook');
        var packageJson = fs.readJsonSync(path.resolve(gbookRoot, 'package.json'));
        var version = packageJson.version;

        var outputFolder = path.resolve(config.VERSIONS_ROOT, version);

        if (!tags.isValid(version)) throw '无效的gbook版本, 应该满足 '+config.GBOOK_VERSION;

        // 复制到安装文件夹
        return Q.nfcall(fs.copy.bind(fs), gbookRoot, outputFolder)
        .thenResolve(version);
    });
}

module.exports = {
    versions: availableVersions,
    resolve: resolveVersion,
    install: installVersion
};
