var Q = require('q');
var _ = require('lodash');
var path = require('path');

var config = require('./config');
var local = require('./local');
var registry = require('./registry');
var tags = require('./tags');

/**
 * 返回book的版本，从bookRoot根目录获取book.json
 * @param {Object} bookRoot
 */
function bookVersion(bookRoot) {
    var version;

    try {
        var bookJson = require(path.resolve(bookRoot, 'book'));
        version = bookJson.gbook;
    } catch (e) {
        if (e.code != 'MODULE_NOT_FOUND') throw e;
    }

    return version || '*';
}

/**
 * 确保版本存在或者安装它
 * @param {Object} bookRoot
 * @param {Object} version
 * @param {Object} opts
 */
function ensureVersion(bookRoot, version, opts) {
    opts = _.defaults(opts || {}, {
        install: true
    });

    return Q()

    // 如果未定义，请从book.json加载所需的版本
    .then(function() {
        if (version) return version;
        return bookVersion(bookRoot);
    })

    // 本地解析版本
    .then(function(_version) {
        version = _version;
        return local.resolve(version)
        // 必要时安装
        .fail(function(err) {
            if (!opts.install) throw err;

            return registry.install(version)
            .then(function() {
                return ensureVersion(bookRoot, version, {
                    install: false
                });
            });
        });
    });
}

/**
 * 从book.json中获取版本
 * @param {Object} bookRoot
 * @param {Object} version
 */
function getVersion(bookRoot, version) {
    return ensureVersion(bookRoot, version, {
        install: false
    });
}

/**
 * 确保存在一个版本（或安装它）然后加载它并返回gbook实例
 * @param {Object} bookRoot
 * @param {Object} version
 * @param {Object} opts
 */
function ensureAndLoad(bookRoot, version, opts) {
    return ensureVersion(bookRoot, version, opts)
    .then(function(version) {
        return local.load(version);
    });
}

/**
 * 更新当前版本
 * -> 检查是否存在更新版本
 * -> 安装它
 * -> 删除以前的版本
 * @param {Object} tag
 */
function updateVersion(tag) {
    tag = tag || 'latest';

    return getVersion(null, {
        install: false
    })
    .fail(function(err) {
        return Q(null);
    })
    .then(function(currentV) {
        return registry.versions()
        .then(function(result) {
            var remoteVersion = result.tags[tag];
            if (!remoteVersion) throw new Error('Tag doesn\'t exist: '+tag);

            if (currentV && tags.sort(remoteVersion, currentV.version) >= 0) return null;

            return registry.install(remoteVersion)
            .then(function() {
                if (!currentV) return;
                return local.remove(currentV.tag);
            })
            .thenResolve(remoteVersion);
        });
    });
}

module.exports = {
    init: config.init,
    setRoot: config.setRoot,

    load: local.load,
    get: getVersion,
    getBookVersion: bookVersion,
    ensure: ensureVersion,
    ensureAndLoad: ensureAndLoad,
    uninstall: local.remove,
    link: local.link,
    versions: local.versions,

    update: updateVersion,

    install: registry.install,
    available: registry.versions
};
