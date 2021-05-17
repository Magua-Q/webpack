#! /usr/bin/env node
console.log('jdpack打包工具')
let path = require('path')
let config = require(path.resolve('webpack.config.js'))
// 编译器处理配置文件
let Compiler = require('../lib/Compiler')
let compiler = new Compiler(config)
compiler.run()