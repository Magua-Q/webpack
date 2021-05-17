// 编译器
let fs = require('fs')
let path = require('path')
let ejs = require('ejs')
// 下面三个在解析代码的时候使用
let types = require("@babel/types")
let babylon = require("babylon")
let traverse = require("@babel/traverse").default
let generator = require("@babel/generator").default
let { SyncHook } = require('tapable')
class Compiler {
    // config: wenpack.config.js
    constructor (config) {
        this.config = config;
        this.entry = config.entry;
        this.entryPath = ''; // 用来存储根路径
        // 当前目录
        this.root = process.cwd();
        // 用来保存所有的依赖模块
        this.modules = {};
        // 添加钩子
        this.hooks = {
            entryOption: new SyncHook(),
            compile: new SyncHook(),
            afterCompile: new SyncHook(),
            run: new SyncHook(),
            emit: new SyncHook(),
            done: new SyncHook()
        };
        // for plugin
        let plugins = this.config.module.plugins;
        if (Array.isArray(plugins)) {
            plugins.forEach(item => {
                item.apply(this);
            })
        }
    }
    // 解析文件
    /**
     * source: 文件内容
     * parentPath: 文件目录
    */
    // TODO: parse
    parse (source, parentPath) {
        // demo
        // const code = "const n = 1"
        const ast = babylon.parse(source)
        let dependencies = []
        traverse(ast, {
            // 获取依赖项
            CallExpression (p) {
                let node = p.node
                if (node.callee.name === 'require') {
                    node.callee.name = '__webpack_require__'; // 修改函数名称
                    // 添加文件扩展名
                    let moduleName = node.arguments[0].value
                    moduleName = moduleName + (path.extname(moduleName) ? '' : '.js')
                    // 拼接完成相对路径
                    moduleName = "./" + path.join(parentPath, moduleName) // ./src/jd.js
                    console.log(moduleName, 'path')
                    // 将子依赖模块存入到dependencies中
                    dependencies.push(moduleName)
                    // 将更新后的子模块依赖名重新写回去
                    node.arguments = [types.stringLiteral(moduleName)]
                }
            }
        })
        let sourceCode = generator(ast).code;
        return {
            sourceCode,
            dependencies
        }
    }
    // 读取文件内容
    getSource (modulePath) {
        console.log(modulePath, 'modulepath')
        // return fs.readFileSync(modulePath, 'utf8')
        // for loader
        let rules = this.config.module.rules;
        let content = fs.readFileSync(modulePath, 'utf8');
        for (let i = 0; i < rules.length; i++) {
            const rule = rules[i];
            let { test, use } = rule;
            let len = use.length - 1;
            // 判断是不是less
            if (test.test(modulePath)) {
                // 是less文件
                // while (len >= 0) {
                //     console.log(use[len])
                //     let loader = require(use[len]);
                //     content = loader(content);
                //     len--;
                // }
                function normalLoader () {
                    let loader = require(use[len--]);
                    content = loader(content);
                    if (len >= 0) {
                        normalLoader();
                    }
                };
                normalLoader();
            }
        };
        return content;
    }
    // 从root节点找所有的依赖模块
    /**
     * modulePath: 文件路径
     * isEntry: 是否是入口文件
    */
    buildModule (modulePath, isEntry) {
        let source = this.getSource(modulePath)
        let moduleName = "./" + path.relative(this.root, modulePath)
        if (isEntry) {
            this.entryPath = moduleName
        }
        // 解析结果是否存在依赖包
        let { sourceCode, dependencies } = this.parse(source, path.dirname(moduleName))
        console.log(sourceCode)
        console.log(dependencies)
        // 保存解析结果
        this.modules[moduleName] = sourceCode
        dependencies.length && dependencies.forEach(dep => {
            this.buildModule(path.join(this.root, dep), false)
        })
    }
    // 打包文件
    emitFile () {
        let main = path.join(this.config.output.path, this.config.output.filename)
        let template = this.getSource(path.join(__dirname, 'boundle.ejs'))
        let result = ejs.render(template, {
            entryPath: this.entryPath,
            modules: this.modules
        });
        this.assets = {};
        this.assets[main] = result; // 文件全名 -- 文件内容
        fs.writeFileSync(main, this.assets[main])
    }
    // 编译方法
    run () {
        this.hooks.run.call(); // 消费
        // root: src/index.js
        // 编译
        this.hooks.compile.call()
        let root = path.resolve(this.root, this.entry)
        this.buildModule(root, true)
        // 编译后
        this.hooks.afterCompile.call()
        this.hooks.emit.call()
        this.emitFile()
        this.hooks.done.call()
    }
}
module.exports = Compiler