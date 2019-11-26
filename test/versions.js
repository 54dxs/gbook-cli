var path = require('path');
var should = require('should');

var manager = require('../lib');

describe('Versions', function() {
    this.timeout(100000);

    describe('.available()', function() {
        var result;

        before(function() {
            return manager.available()
            .then(function(versions) {
                result = versions;
            });
        });

        it('应正确返回一个 versions 列表', function() {
            result.should.have.properties('versions');
            result.versions.should.be.an.Array();
        });

        it('应正确返回一个 tags 集合', function() {
            result.should.have.properties('tags');
            result.tags.should.have.properties('latest');
        });
    });

    describe('.install()', function() {
        var result;

        before(function() {
            return manager.install('1.0.0')
            .then(function(version) {
                result = version;
            });
        });

        it('应正确返回已安装的版本', function() {
            result.should.be.a.String();
            result.should.equal('1.0.0');
        });
    });

    describe('.ensure()', function() {
        it('应正确返回已安装的版本', function() {
            return manager.ensure(__dirname)
            .then(function(v) {
                v.should.have.properties('version', 'path');
                v.version.should.equal('1.0.0');
            });
        });

        it('应正确安装指定的版本', function() {
            return manager.ensure(path.resolve(__dirname, 'fixtures/book1'))
            .then(function(v) {
                v.should.have.properties('version', 'path');
                v.version.should.equal('1.0.0');
            });
        });
    });

    describe('.list()', function() {
        var result;

        before(function() {
            result = manager.versions();
        });

        it('应正确返回已安装的版本', function() {
            result.should.be.an.Array();
            // result.should.have.lengthOf(2);
            result[0].should.have.properties('name', 'tag', 'version', 'path');
            result[0].version.should.equal('1.0.0');
            // result[1].should.have.properties('name', 'tag', 'version', 'path');
            // result[1].version.should.equal('1.0.1');
        });
    });

   //  describe('.link()', function() {
   //      var localGbook = path.resolve(__dirname, '../node_modules/gbook');

   //      before(function() {
			// console.log('localGbook---', localGbook)
   //          return manager.link('latest', localGbook);
   //      });

   //      it('should correctly list latest version', function() {
   //          var result = manager.versions();
			// console.log('result---', result)
   //          // result.should.have.lengthOf(1);
   //          // result.should.have.lengthOf(3);
   //          // result[1].should.have.properties('version', 'path');
   //          // result[1].tag.should.equal('beta');
   //          // result[1].name.should.equal('latest');
   //          // result[1].link.should.equal(localGbook);
   //      });

   //      it('should correctly return latest version as default one', function() {
   //          return manager.get(__dirname)
   //          .then(function(version) {
   //              // version.name.should.equal('latest');
   //              version.name.should.equal('1.0.0');
   //          });
   //      });
   //  });

    describe('.ensureAndLoad()', function() {
        it('应正确返回一个 gbook 实例', function() {
            return manager.ensureAndLoad(__dirname)
            .then(function(gbook) {
                gbook.should.be.an.Object();
                gbook.should.have.properties('commands');
                gbook.commands.should.be.an.Array();
            });
        });
    });

    describe('.uninstall()', function() {
        it('should correctly remove a specific version', function() {
            return manager.uninstall('2.0.0')
            .then(function() {
                var result = manager.versions();
                result.should.have.lengthOf(2);
            });
        });

        it('should correctly remove a version by tag', function() {
            return manager.uninstall('latest')
            .then(function() {
                var result = manager.versions();
                result.should.have.lengthOf(1);
            });
        });
    });
});
