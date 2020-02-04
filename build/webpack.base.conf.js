const webpack = require('webpack')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin') // 将 css 单独打包成文件
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const path = require('path')

const productionConfig = require('./webpack.prod.conf.js') // 引入生产环境配置文件
const developmentConfig = require('./webpack.dev.conf.js') // 引入开发环境配置文件

/**
 * 根据不同的环境，生成不同的配置
 * @param {String} env "development" or "production"
 */
const generateConfig = env => {
    const isDevMode = env === 'development'
    // 将需要的 Loader 和 Plugin 单独声明

    let scriptLoader = [
        {
            loader: 'babel-loader',
        },
    ]

    let cssLoader = [
        'style-loader',
        'css-loader',
        'sass-loader', // 使用 sass-loader 将 scss 转为 css
        'postcss-loader', // autoprefix 为 css 加上浏览器前缀
    ]

    let cssExtractLoader = [
        {
            loader: MiniCssExtractPlugin.loader,
        },
        'css-loader',
        'sass-loader', // 使用 sass-loader 将 scss 转为 css
        'postcss-loader', // 使用 postcss 为 css 加上浏览器前缀
    ]

    let fontLoader = [
        {
            loader: 'url-loader',
            options: {
                name: '[name]-[hash:5].min.[ext]',
                limit: 5000, // fonts file size <= 5KB, use 'base64'; else, output svg file
                publicPath: 'fonts/',
                outputPath: 'fonts/',
            },
        },
    ]

    let imageLoader = [
        {
            loader: 'url-loader',
            options: {
                name: '[name]-[hash:5].min.[ext]',
                limit: 10000, // size <= 10KB
                outputPath: 'images/',
            },
        },
        // 图片压缩
        {
            loader: 'image-webpack-loader',
            options: {
                // 压缩 jpg/jpeg 图片
                mozjpeg: {
                    progressive: true,
                    quality: 50, // 压缩率
                },
                // 压缩 png 图片
                pngquant: {
                    quality: '65-90',
                    speed: 4,
                },
            },
        },
    ]

    const styleLoader = isDevMode
        ? cssLoader // 开发环境：页内样式嵌入
        : cssExtractLoader // 生产环境下压缩 css 代码

    return {
        entry: { main: './src/main.js', 'ie-chore-polyfill': './src/ie-chore-polyfill.js' },
        output: {
            publicPath: '/dist/',
            path: path.resolve(__dirname, '..', 'dist'),
            filename: '[name].js',
            chunkFilename: '[name].chunk.js',
        },

        optimization: {
            // splitChunks
            // layui + layuiadmin 割一份
            // layuiadmin.config.js 接手维护成 ys.config.js + ys 公共文件 割一份
            // 业务代码要么写页面上， 要么每个页面对应一个js文件， 或者根据路由动态加载（2）， 或者html模板借用工具生成（1）
            //  写路由配置 import().then 动态加载(0)
            splitChunks: {
                // chunks: 'all',
                // minSize: 30000,
                // maxSize: 0,
                // minChunks: 1,
                // maxAsyncRequests: 5,
                // maxInitialRequests: 3,
                // automaticNameDelimiter: '~',
                // name: true,
                // cacheGroups: {
                //     layui: {
                //       name: 'layui',
                //       test: /[\\/]src[\\/]layui[\\/]/,
                //       priority: 5  // 优先级要大于 vendors 不然会被打包进 vendors
                //     },
                //     'ie-polyfill': {
                //       name: 'ie-polyfill',
                //       test: /[\\/]src[\\/]ie-polyfill[\\/]/,
                //       priority: 5  // 优先级要大于 vendors 不然会被打包进 vendors
                //     },
                //     // commons: {
                //     //     name: 'commons',
                //     //     minSize: 0, //表示在压缩前的最小模块大小,默认值是 30kb
                //     //     minChunks: 2, // 最小公用次数
                //     //     priority: 5, // 优先级
                //     //     reuseExistingChunk: true, // 公共模块必开启
                //     // },
                //     // chunks===all 时， 文件里用了 node_modules 的库就要被打包走了。 麻了
                //     vendors: {
                //         name: 'vendors',
                //         test: /[\\/]node_modules[\\/]/,
                //         priority: -10,
                //     },
                //     default: {
                //         minChunks: 2,
                //         priority: -20,
                //         reuseExistingChunk: true,
                //     },
                // },
            },
        },
        module: {
            rules: [
                { test: /\.js$/, exclude: /(node_modules)/, use: scriptLoader },
                { test: /\.(sa|sc|c)ss$/, use: styleLoader },
                { test: /\.(eot|woff2?|ttf|svg)$/, use: fontLoader },
                { test: /\.(png|jpg|jpeg|gif)$/, use: imageLoader },
            ],
        },

        plugins: [
            // 开发环境和生产环境二者均需要的插件
            // new HtmlWebpackPlugin({
            //     title: 'index',
            //     filename: 'index.html',
            //     template: path.resolve(__dirname, '../views/index.html'),
            //     // chunks: ['app'],
            // }),
            // new webpack.ProvidePlugin({ $: 'jquery' }),
            new CleanWebpackPlugin(),

            //
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(env),
            }),
        ],
    }
}

module.exports = env => {
    let config = env === 'production' ? productionConfig : developmentConfig
    return merge(generateConfig(env), config) // 合并 公共配置 和 环境配置
}
