var _ = require('lodash');
var semver = require('semver');
var config = require('./config');

var ALLOWED_TAGS = ['latest', 'pre', 'beta', 'alpha'];

/**
 * 如果tag是一个version则返回true
 * @param {Object} version
 */
function isTag(version) {
    return _.includes(ALLOWED_TAGS, version);
}

/**
 * 如果version符合gbook-cli的标准，则返回true
 * @param {Object} version
 */
function isValid(version) {
    if (isTag(version)) return true;

    var versionWithoutPre = version.replace(/\-(\S+)/g, '');

    try {
        return semver.satisfies(versionWithoutPre, config.GBOOK_VERSION);
    } catch(e) {
        return false;
    }
}

/**
 * 从version中提取预发布tag
 * @param {Object} version
 */
function getTag(version) {
    if (isTag(version)) return version;

    var v = semver.parse(version);
    return v.prerelease[0] || 'latest';
}

/**
 * 排序versions（预发布的版本tags在考虑中）
 * @param {Object} a
 * @param {Object} b
 */
function sortTags(a, b) {
    if (isTag(a) && isTag(b)) {
        var indexA = ALLOWED_TAGS.indexOf(a);
        var indexB = ALLOWED_TAGS.indexOf(b);

        if (indexA > indexB) return -1;
        if (indexB > indexA) return 1;

        return 0;
    }
    if (isTag(a)) return -1;
    if (isTag(b)) return 1;

    if (semver.gt(a, b)) {
        return -1;
    }
    if (semver.lt(a, b)) {
        return 1;
    }
    return 0;
}

/**
 * 如果版本满足条件，则返回true
 * @param {Object} version
 * @param {Object} condition
 * @param {Object} opts
 */
function satisfies(version, condition, opts) {
    opts = _.defaults(opts || {}, {
        acceptTagCondition: true
    });

    if (isTag(version)) {
        return (condition == '*' || version == condition);
    }

    // 条件是一个tag ('beta', 'latest')
    if (opts.acceptTagCondition) {
        var tag = getTag(version);
        if (tag == condition) return true;
    }

    return semver.satisfies(version, condition);
}

module.exports = {
    isTag: isTag,
    isValid: isValid,
    sort: sortTags,
    satisfies: satisfies,
    getTag: getTag
};
