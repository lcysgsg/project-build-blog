const webpack = require('webpack')

const path = require('path')

module.exports = {
    mode: 'development',
    devtool: 'source-map', // 调试源码
    devServer: {
        index: 'app.html',
        contentBase: [
            path.join(__dirname, '../views'),
            path.join(__dirname, '../static'),
        ],
        publicPath: '/dist',
        port: 8000,
        // hot: true,
        overlay: true,
        historyApiFallback: true,
        writeToDisk: true,
        proxy: {
            '/comments': {
                target: 'https://m.weibo.cn',
                changeOrigin: true,
                logLevel: 'debug',
                headers: {
                    Cookie: '',
                },
            },
        },
    },
    plugins: [
      // new webpack.HotModuleReplacementPlugin(), 
      // new webpack.NamedModulesPlugin()
    ],
}
