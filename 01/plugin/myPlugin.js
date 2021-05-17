class MyPlugin {
  apply (compiler) {
    console.log('开始编译start');
    // 注册订阅
    compiler.hooks.emit.tap('emit', () => {
      console.log('emit')
    })
  };
}

module.exports = MyPlugin