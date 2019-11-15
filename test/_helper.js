var path = require('path');
var fs = require('fs-extra');
var manager = require('../lib');

// Use tmp folder for testing
before(function() {
    var gbookFolder = path.resolve(__dirname, '../.tmp');
    fs.removeSync(gbookFolder);
    manager.setRoot(gbookFolder);
    manager.init();
});
