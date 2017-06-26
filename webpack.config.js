/**
 * Created by kellenren on 2016/7/13.
 */
var path = require('path');
var webpack = require('webpack');
var definePlugin = new webpack.DefinePlugin({
    __CGI_DOMAIN__: JSON.stringify("http://jiangyou.qq.com")
    //__CGI_DOMAIN__: JSON.stringify("http://appicsh.qq.com")
});
module.exports = {
    entry:{
        index: ['./lib/finger.js','./lib/trasform.js', './src/viewer.js']
    },
    output:{
        filename: '[name].js'
    },
    'ejs-compiled-loader': {
        'compileDebug': false,
        'beautify': true,
        'htmlmin': true, // or enable here
        'htmlminOptions': {
            removeComments: true,
            collapseWhitespace: true
        }
    },
    resolve :{
        alias: {
           
        }
    },
    module: {
        preLoaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'eslint-loader'
            },
        ],
        loaders: [
            {test: /\.css$/, loader: "style!css" },
            {test: /\.ejs$/, loader: "ejs-compiled?htmlmin"},
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            }
        ]
    },
    plugins: [definePlugin]
}