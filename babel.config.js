module.exports = function(api) {
    api.cache(true)

    const presets = [
        [
            '@babel/preset-env',
            {
                debug: false,
                useBuiltIns: 'entry',
                corejs: 3,
                loose: true,
            },
        ],
    ]
    const plugins = [
        [
            '@babel/plugin-transform-modules-commonjs',
            {
                allowTopLevelThis: true,
            },
        ],
        '@babel/plugin-transform-runtime',
    ]

    return {
        presets,
        plugins,
    }
}
