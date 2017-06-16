//var webpackUglifyJsPlugin = require('webpack-uglify-js-plugin');
var webpack = require("webpack");
const NODE_ENV = process.env.NODE_ENV || 'development';

var plugins = [];

if(NODE_ENV != 'development'){
	plugins.push(new webpack.optimize.UglifyJsPlugin({
		beautify: false,
		comments: false,
		compress: {
			sequences     : true,
			booleans      : true,
			loops         : true,
			unused      : true,
			warnings    : false,
			drop_console: true,
			unsafe      : true
		},
		sourceMap: false,
	}));

	plugins.push(new webpack.optimize.DedupePlugin());
	plugins.push(new webpack.NoErrorsPlugin());
}


module.exports = {
	entry: {
		index: './src/index.js',
	},
	output: {
		path: __dirname + '/',
		filename: 'bundle.js',
		publicPath: "/",
	},
	watch: NODE_ENV == 'development',
	plugins: plugins,
	module: {
		loaders: [{
			exclude: /node_modules/,
			loader: 'babel',
			query: {
				plugins: [
					//'transform-runtime',
					//require('babel-plugin-transform-react-remove-prop-types').default,
					///'transform-react-constant-elements',
					//'transform-react-inline-elements'
				],
				presets: ['es2015', 'stage-0', 'react'],
			}
		},{
			test: /\.svg$/,
			loader: 'svg-inline'
		},{
			test: /\.json$/,
			loader: 'json'
		},]
	},
	//devtool: NODE_ENV == 'development' ? "cheap-inline-module-source-map" : null,
	devtool: null,
	resolve: {
		extensions: ['', '.js']
	},
	devServer: {
		contentBase: './',
		publicPath: "/bundle/",
	}
};