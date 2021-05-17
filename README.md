# webpack
### webpack如何工作
+ 如何执行打包命令
+ 打包完输出到dist目录，通过html文件引入到浏览器上运行

### 如何手写自己的打包工具
+ 分析打包生成的文件boundle.js
```js
 // 分析boundle.js文件
文件结构：（function(modules) {处理模块加载}）（{文件： fun， 文件： fun}）
    1.  将引用的文件路径不全，如“./jd”转化后是“./jd.js”
    2. 将node中require函数替换webpack自定义加载函数__webpack_require__
```
+ 实现： 执行xx命令，从webpack.config.js打包项目并生成bundle.js

### 01-创建打包命令
+ 创建命令的目录
+ 生成webpapck.json
+ 生成命令，npm link（创建全局快捷方式）

### 02-查找所有的依赖模块
+ 读取代码内容
+ 读取模块文件相对路径
+ 读取模块文件中依赖的包，首先需要解析
+ 解析结果： 是否存在子依赖包，解析的源码souceCode
+ vue ===> html、css、js es6 ===> es5

### 03-代码解析的过程
> vue ===> html、css、js es6 ===> es5
+ 使用ast语法树解析[https://astexplorer.net/]
+ 如const n = 1; -> const x = 1;
+ 将代码中的require替换成__webpack_require__
+ 补全文件后缀，将require("./jd")转化成require("./jd.js")
+ 收集dependencies
### 04-打包输出
+ 使用模版生成boundle.js, 传入的参数必须是动态的
+ 模板express ejs
+ 使用fs将生成的文件写入bundle.js, 使用index.html引入打开测试与之前webpack打包输出一样
### 05-loader装载器
- less sass vue...
- 作用： 转化 less转化为css 
- 使用自定义的loader less-loader style-loader
- 打包的时候使用自定义的loader

### 06-plugin
- 代码加工：压缩、合并、混入等等
