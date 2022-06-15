module.exports = {
    publicPath: './',
    productionSourceMap: false,
    outputDir: "dist",
    chainWebpack: config => {
        config.module
            .rule('images')
            .test(/\.(png|jpe?g|gif|webp|bmp)$/)
            .use('url-loader')
            .loader('url-loader')
            .tap(options => Object.assign(options, { limit: 500000 }))
        config.module
            .rule('fonts')
            .test(/\.(ttf|woff)$/)
            .use('url-loader')
            .loader('url-loader')
            .tap(options => Object.assign(options, { limit: 500000 }))
        config.plugin('preload')
            .tap(args => {
                args[0].fileBlacklist.push(/\.css/, /\.js/)
                return args
            })
        config.plugin('inline-source')
            .use(require('html-webpack-inline-source-plugin'))
        config
            .plugin('html')
            .tap(args => {
                args[0].inlineSource = '(\.css|\.js$)'
                return args
            })
        config.optimization.minimizer('terser').tap((args) => {
            args[0].terserOptions.compress.drop_console = true
            return args
            })
    }
}