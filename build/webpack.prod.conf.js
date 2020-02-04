const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin') // 将 css 单独打包成文件

module.exports = {
    mode: 'production',
    optimization: {
        minimizer: [
            new TerserPlugin({
                sourceMap: true,
                exclude: /node_modules/,
                terserOptions: {
                    // TODO：待确认：解决 ie8 下`缺少标识符`的情况（保留关键字）
                    ie8: true,
                },
            }),
        ],
        // splitChunks: {
        //     chunks: 'all',
        //     cacheGroups: {
        //         jquery: {
        //             name: 'chunk-jquery', // 单独将 jquery 拆包
        //             priority: 15,
        //             test: /[\\/]node_modules[\\/]jquery[\\/]/,
        //         },
        //     },
        // },
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css',
        }),
    ],
}
