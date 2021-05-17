let path = require('path')
let MyPlugin = require('./plugin/myPlugin')
module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.less$/,
                use: [
                    // "style-loader",
                    // "css-loader",
                    // "less-loader"
                    path.resolve(__dirname, 'loader', 'style-loader'),
                    path.resolve(__dirname, 'loader', 'less-loader')
                ]
            }
        ],
        plugins: [
            new MyPlugin()
        ]
    }
}