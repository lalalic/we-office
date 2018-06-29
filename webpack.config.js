const path = require('path')
const {ContextReplacementPlugin, DefinePlugin, IgnorePlugin} = require("webpack")
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin')
const UglifyJsPlugin = require("uglifyjs-webpack-plugin")

const HTML={
	template:require.resolve('qili-app/index.tmpl'),
	title:"QiLi App",
	favicon: "./dist/favicon.ico",
}

module.exports=env=>{
	const base={
		entry:{
			index:["babel-polyfill",require.resolve("./src/index.js")],
		},
		output:{
			filename:"[name].js",
			path:path.resolve(__dirname, 'dist'),
			chunkFilename: '[name].js'
		},
		devtool:false,
		module:{
			rules:[{
				test: /.js?$/,
				use: 'babel-loader',
				exclude: /node_modules/,
				include: /src/,
			},{
				test: /\.js?$/,
				use: ["transform-loader/cacheable?brfs"],
				enforce:"post",
				include: /(linebreak|unicode-properties|fontkit|pdfkit)/
			},{
				test:/.less?$/,
				use: [
					'style-loader',
					'css-loader',
					'less-loader',
				]
			},{
				test:/.graphql?$/,
				use: 'text-loader'
			},{
				test:require.resolve("./cloud/index.js"),
				use: "imports-loader?Cloud=qili-app/makeOfflineSchema"//path relative to test
			}]
		},
		node:{
			fs:"empty",
		},
		plugins:[
			new UglifyJsPlugin(),
			new DefinePlugin({
				'process.env.NODE_ENV': JSON.stringify('production')
			}),
			new ContextReplacementPlugin(/graphql-language-service-interface[\/\\]dist/, /\.js$/),
			new ContextReplacementPlugin(/transformation[\/\\]file/, /\.js$/),
			new ContextReplacementPlugin(/source-map[\/\\]lib/, /\.js$/),
			new HtmlWebpackPlugin({
				...HTML,
				inlineSource: 'index.js$'
			}),

			new HtmlWebpackInlineSourcePlugin(),

			//new IgnorePlugin(/^react-router$/)
		]
	}

	if(env){
		return require(`./webpack.${env}.js`)(base,HTML)
	}

	return base
}
