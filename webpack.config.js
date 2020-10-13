const path = require('path')
const {ContextReplacementPlugin} = require("webpack")
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin')

const HTML={
	template:require.resolve('qili-app/index.tmpl'),
	title:"we-office",
	favicon: "./dist/favicon.ico",
	extra:'<div id="wo" style="position:fixed;top:0px;left:0px;width:100%;height:100%;"/>',
}

module.exports=env=>{
	const base={
		entry:{
			index:["@babel/polyfill","./src/www/browser.js"],
			app:["@babel/polyfill","./src/index.js"],
		},
		output:{
			filename:"[name].js",
			path:path.resolve(__dirname, 'dist'),
			devtoolNamespace:"we-office"
		},
		devtool:false,
		mode:"production",
		module:{
			rules:[{
				test: /.js?$/,
				use: 'source-map-loader',
				enforce:"pre",
				include: /(we-edit|docx4js)/
			},{
				test: /.js?$/,
				use: 'babel-loader',
				exclude: /node_modules/,
			},{
				test: /\.js?$/,
				use: ["transform-loader/cacheable?brfs"],
				enforce:"post",
				include: /(linebreak|unicode-properties|fontkit|pdfkit)/
			},{
				test:/.(css|less)$/,
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
			},{
				test:/.md$/,
				use:'raw-loader'
			}
			]
		},
		externals:{
			"module":"{}",
			"net":"{}",
			"fs":"{}"
		},
		plugins:[
			new ContextReplacementPlugin(/graphql-language-service-interface[\/\\]dist/, /\.js$/),
			new ContextReplacementPlugin(/transformation[\/\\]file/, /\.js$/),
			new ContextReplacementPlugin(/source-map[\/\\]lib/, /\.js$/),
			new HtmlWebpackPlugin({
				...HTML,
				chunks:["app"],
				inlineSource: 'app.js$',
				minify:true,
			}),

			new HtmlWebpackPlugin({
				...HTML,
				chunks:["app"],
				inlineSource: 'app.js$',
				filename:"cordova.html",
				extra:'<script type="text/javascript" src="cordova.js"></script>',
			}),

			new HtmlWebpackInlineSourcePlugin()
		]
	}

	if(env){
		return require(`./webpack.${env}.js`)(base,HTML)
	}

	return base
}
