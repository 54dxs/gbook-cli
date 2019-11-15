# gbook-cli

[![NPM version](https://badge.fury.io/js/gitbook-cli.svg)](http://badge.fury.io/js/gitbook-cli)
[![Linux Build Status](https://travis-ci.org/GitbookIO/gitbook-cli.png?branch=master)](https://travis-ci.org/GitbookIO/gitbook-cli)
[![Windows Build status](https://ci.appveyor.com/api/projects/status/gddbj0602joc4wah?svg=true)](https://ci.appveyor.com/project/GitBook/gitbook-cli)

> GBook命令行界面。

全局安装此程序，您将可以在系统上的任何位置访问gbook命令。

```
$ npm install -g gbook-cli
```

**注意:** gbook命令的目的是加载并运行您在书中指定的gbook版本（或最新版本），而不管其版本如何。GBook CLI仅支持 `>=2.0.0` GitBook 版本。

`gbook-cli` 将GBook的版本存储到 `~/.gbook` 中，您可以将GBOOK_DIR环境变量设置为使用另一个目录。

## 如何安装？

```
$ npm install -g gbook-cli
```

## 如何使用它？

### 运行 GBook

运行命令 `gbook build`, `gbook serve` (有关详细信息，请阅读 [GBook 文档](https://github.com/GitbookIO/gitbook/blob/master/docs/setup.md))。

使用以下命令列出所有可用命令：
```
$ gbook help
```

#### 指定特定版本

默认情况下，GBook CLI将从书籍配置中读取要使用的gbook版本，但是您可以使用以下 `--gbook` 选项强制使用特定版本：

```
$ gbook build ./mybook --gbook=2.0.1
```

并使用以下命令列出此版本中的可用命令：

```
$ gbook help --gbook=2.0.1
```

#### 管理版本

列出已安装的版本：

```
$ gbook ls
```

列出NPM上的可用版本：

```
$ gbook ls-remote
```

安装特定版本：

```
$ gbook fetch 2.1.0

# 或者一个预发行(pre-release)

$ gitbook fetch beta
```

更新到最新版本

```
$ gbook update
```

卸载特定版本

```
$ gbook uninstall 2.0.1
```

使用本地文件夹作为GBook版本（用于开发）

```
$ gbook alias ./mygbook latest
```

