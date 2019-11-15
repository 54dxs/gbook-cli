var _ = require('lodash');

/**
 * 打印帮助的帮助函数，按空格缩进的输出
 * @param {Object} n
 * @param {Object} name
 * @param {Object} description
 */
function indent_output(n, name, description) {
    if (!n) {
        n = 0;
    }
    
    console.log(
        _.repeat('    ', n)
        + name
        + _.repeat(' ', 32 - n * 4 - name.length)
        + description
    );
}

/**
 * 打印命令列表的帮助
 * 它打印命令及其描述，然后打印所有选项
 * @param {Object} commands
 */
function help(commands) {
    _.each(commands, function(command) {
        indent_output(1, command.name, command.description);
        _.each(command.options || [], function(option) {
            var after = [];

            if (option.defaults !== undefined) after.push("默认是 "+option.defaults);
            if (option.values) after.push("Values are "+option.values.join(", "));

            if (after.length > 0) after = "("+after.join("; ")+")";
            else after = "";

            var optname = '--';
            if (typeof option.defaults === 'boolean') optname += '[no-]';
            optname += option.name;
            indent_output(2, optname, option.description + ' ' + after);
        });
        console.log('');
    });
}

/**
 * 从列表中执行命令
 * 有一组特定的args/kwargs
 * @param {Object} commands
 * @param {Object} command
 * @param {Object} args
 * @param {Object} kwargs
 */
function exec(commands, command, args, kwargs) {
    var cmd = _.find(commands, function(_cmd) {
        return _.first(_cmd.name.split(" ")) == command;
    });

    // 找不到命令
    if (!cmd) throw new Error('命令 '+command+' 不存在, 运行 "gbook help" 列出可用命令');

    // 应用默认值
    _.each(cmd.options || [], function(option) {
        kwargs[option.name] = (kwargs[option.name] === undefined)? option.defaults : kwargs[option.name];
        if (option.values && !_.includes(option.values, kwargs[option.name])) {
            throw new Error('选项的值无效 "'+option.name+'"');
        }
    });

    return cmd.exec(args, kwargs);
}

module.exports = {
    help: help,
    exec: exec
};
