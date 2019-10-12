const path = require('path')
const {ContextReplacementPlugin} = require("webpack")
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports=(base,HTML,port=require("./package.json").config.devPort)=>{
	return {
		...base,
		entry:{
			index:["@babel/polyfill","./.test.www.js"],
			app:["@babel/polyfill","./.test.js","./src/index.js"],
		},
		devtool: 'source-map',
		devServer:{
			contentBase: path.join(__dirname, "dist"),
			port,
			host:"0.0.0.0",
			before(app){
				app.get("/app.apk.version",(req, res)=>res.json(require("./package.json").version))

				app.get("/font-service.js", (req,res)=>{
					res.set({ 'Content-Type': 'application/javascript; charset=utf-8' });
                	res.send(require("fs").readFileSync(path.join(__dirname, 'node_modules/we-edit/font-service.js')));
				})

				app.get("/fonts/Arial", (req,res)=>{
					res.set({ 'Content-Type': 'font' });
                	res.send(require("fs").readFileSync(path.join(__dirname, 'node_modules/we-edit/Arial')));
				})
			},
			historyApiFallback:true,
			proxy:{
				"/www":{
					target:"http://localhost:9080",
					pathRewrite:{
						"/www":"/1/5b07b8571f6cab002e832d23/static",
					},
					changeOrigin:true
				}
			}
		},
		plugins:[
			new ContextReplacementPlugin(/graphql-language-service-interface[\/\\]dist/, /\.js$/),
			new ContextReplacementPlugin(/transformation[\/\\]file/, /\.js$/),
			new ContextReplacementPlugin(/source-map[\/\\]lib/, /\.js$/),
			new HtmlWebpackPlugin({...HTML}),
			/*
			new HtmlWebpackPlugin({
				...HTML,
				extra:'<script type="text/javascript" src="cordova.js"></script>',
				filename:"cordova.html",
			}),
			*/
		]
	}
}
