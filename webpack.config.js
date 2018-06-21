const UglifyEsPlugin = require('uglify-es-webpack-plugin');
const webpack = require('webpack');

const libraryName = 'vue-terminal-ui';
const buildTarget = process.env.TARGET === 'window' ? 'window' : 'umd';
const outputFile = `${libraryName}-${buildTarget}.js`;

module.exports = {
     entry: './index.js',
        output: {
            path: __dirname,
            filename: 'dist/vue-terminal-ui.js',
        },
     module: {
         loaders: [
            {
				test: /\.vue$/,
				loader: 'vue-loader'
			},{
             test: /\.js$/,
             exclude: /node_modules/,
             loader: 'babel-loader',
              query: {
                presets: ['latest']
            }
         }]
     },
     output: {
        path: __dirname + '/dist',
        filename: outputFile,
        library: libraryName,
        libraryTarget: buildTarget,
        umdNamedDefine: true
    },
    plugins: [
        new UglifyEsPlugin(),
        new webpack.BannerPlugin({
            banner: "Vue.js Terminal UI emulator \n https://github.com/shershen08/vue-terminal-ui/ \n file:[file]"
        })
    ]
 }