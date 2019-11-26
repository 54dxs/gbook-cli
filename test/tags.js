var should = require('should');
var tags = require('../lib/tags');

describe('tags.js', function() {
    describe('.isValid()', function() {
        it('对于 version >= 2.0.0 应该返回true', function() {
            tags.isValid('2.0.0').should.be.ok()
        });

        it('对于 pre-releases 应该返回true', function() {
            tags.isValid('2.0.0-beta.0').should.be.ok()
        });
    });

    describe('.satisfies()', function() {
        it('对于 tag 和 * 应该返回true', function() {
            tags.satisfies('pre', '*').should.be.ok()
        });
    });

    describe('.sort()', function() {
        it('should sort tags first', function() {
            tags.sort('pre', '1.0.0').should.equal(-1);
            tags.sort('beta', '1.0.0').should.equal(-1);
            tags.sort('alpha', '1.0.0').should.equal(-1);
        });

        it('should sort tags correctly', function() {
            tags.sort('alpha', 'pre').should.equal(-1);
            tags.sort('alpha', 'beta').should.equal(-1);
        });

        it('should sort pre versions first', function() {
            tags.sort('1.0.0-pre.1', '0.0.9').should.equal(-1);
            tags.sort('1.0.0-pre.1', '1.0.0').should.equal(1);
        });
    });
});
