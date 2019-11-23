#! /usr/bin/env node

var Q = require('q');// Q是nodeJs中实现promise的包之一，是nodeJs中比较常用的一个库。
var _ = require('lodash');// 工具类库
var path = require('path');
var program = require('commander');// 命令行参数解析
var parsedArgv = require('optimist').argv;// 命令行参数解析
var color = require('bash-color');

var pkg = require('../package.json');
var manager = require('../lib');
var tags = require('../lib/tags');
var commands = require('../lib/commands');

// 将要创建的书本📖目录,默认为命令行窗口的启动目录,可通过命令行参数设置
// D:\GitHub\node\gbook-cli>
var bookRoot = parsedArgv._[1] || process.cwd();

/**
 * 执行异步任务
 * @param {Object} p
 */
function runPromise(p) {
    return p
    .then(function() {
        process.exit(0);
    }, function(err) {
        console.log('');
        console.log(color.red(err.toString()));
        if (program.debug || process.env.DEBUG) console.log(err.stack || '');
        process.exit(1);
    });
}

/**
 * 打印gbook版本
 * @param {Object} v
 */
function printgbookVersion(v) {
    var actualVersion = (v.name != v.version)? ' ('+v.version+')' : '';
    return v.name + actualVersion;
}

// Init gbook-cli
manager.init();

program
    .option('-v, --gbook [version]', '指定要使用的gbook版本')
    .option('-d, --debug', '启用debug模式，将输出详细错误')
    .option('-V, --version', '显示gbook和gbook-cli的运行版本', function() {
        console.log('CLI version:', pkg.version);
        runPromise(
            manager.ensure(bookRoot, program.gbook)
            .then(function(v) {
                console.log('gbook version:', printgbookVersion(v));
                process.exit(0);
            })
        );
    });

program
    .command('ls')
    .description('列出本地安装的版本')
    .action(function(){
        var versions = manager.versions();

        if (versions.length > 0) {
            console.log('已安装gbook版本：');
            console.log('');

            _.each(versions,function(v, i) {
                var text = v.name;
                if (v.name != v.version) text += ' [' + v.version + ']';
                if (v.link) text = text + ' (alias of ' + v.link + ')';

                console.log('   ', i == 0? '*' : ' ', text);
            });
            console.log('');
            console.log('运行“gbook update”更新到最新版本。');
        } else {
            console.log('未安装任何版本');
            console.log('您可以使用“gbook fetch”安装最新版本');
        }
    });

program
    .command('current')
    .description('显示当前激活的版本')
    .action(function(){
        runPromise(
            manager.ensure(bookRoot, program.gbook)
            .then(function(v) {
                console.log('当前激活的gbook版本：', printgbookVersion(v));
            })
        );
    });

program
    .command('ls-remote')
    .description('列出可用于安装的远程版本')
    .action(function(){
        runPromise(
            manager.available()
            .then(function(available) {
                console.log('可用的gbook版本：');
                console.log('');
                console.log('   ', available.versions.join('\n    '));
                console.log('');
                console.log('Tags:');
                console.log('');
                _.each(available.tags, function(version, tagName) {
                    console.log('    ', tagName, ':', version);
                });
                console.log('');
            })
        );
    });

program
    .command('fetch [version]')
    .description('下载并安装<version>')
    .action(function(version){
        version = version || '*';

        runPromise(
            manager.install(version)
            .then(function(installedVersion) {
                console.log('');
                console.log(color.green('gbook '+installedVersion+' 已安装'));
            })
        );
    });

program
    .command('alias [folder] [version]')
    .description('设置一个名为<version>的别名，指向<folder>')
    .action(function(folder, version) {
        folder = path.resolve(folder || process.cwd());
        version = version || 'latest';

        runPromise(
            manager.link(version, folder)
            .then(function() {
                console.log(color.green('gbook '+version+' 指向 '+folder));
            })
        );
    });

program
    .command('uninstall [version]')
    .description('卸载<version>')
    .action(function(version){
        runPromise(
            manager.uninstall(version)
            .then(function() {
                console.log(color.green('gbook '+version+' 已卸载'));
            })
        );
    });

program
    .command('update [tag]')
    .description('更新至gbook的最新版本')
    .action(function(tag){
        runPromise(
            manager.update(tag)
            .then(function(version) {
                if (!version) {
                    console.log('找不到更新！');
                } else {
                    console.log('');
                    console.log(color.green('gbook已更新为 '+version));
                }
            })
        );
    });

program
    .command('help')
    .description('罗列gbook的所有命令')
    .action(function(){
        runPromise(
            manager.ensureAndLoad(bookRoot, program.gbook)
            .get('commands')
            .then(commands.help)
        );
    });

program
    .command('*')
    .description('使用特定的gbook版本运行命令')
    .action(function(commandName){
        var args = parsedArgv._.slice(1);
        var kwargs = _.omit(parsedArgv, '$0', '_');

        runPromise(
            manager.ensureAndLoad(bookRoot, program.gbook)
            .then(function(gbook) {
                return commands.exec(gbook.commands, commandName, args, kwargs);
            })
        );
    });

// 如果没有参数，则分析并回退以提供帮助
if(_.isEmpty(program.parse(process.argv).args) && process.argv.length === 2) {
    program.help();
}
