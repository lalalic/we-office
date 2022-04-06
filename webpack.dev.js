const path = require('path')
const {ContextReplacementPlugin} = require("webpack")
const HtmlWebpackPlugin = require('html-webpack-plugin')
const Visualizer=require("webpack-visualizer-plugin")
process.env.NODE_ENV="local"


module.exports=(base,HTML,port=require("./package.json").config.devPort)=>{
	console.log(`process.env.NODE_ENV=${process.env.NODE_ENV}`)
	return {
		...base,
		entry:{
			"index":["@babel/polyfill","qili-app/index.less","./src/index.less","./.test.www.js"],
			app:["@babel/polyfill","./.test.js","./src/index.js"]
		},
		devtool: 'source-map',
		mode:"development",
		devServer:{
			contentBase: path.join(__dirname, "dist"),
			port,
			host:"0.0.0.0",
			allowedHosts:["wenshubu.com","app.wenshubu.com"],
			disableHostCheck:true,
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
			/*
			historyApiFallback:{
				verbose:true,
				disableDotRule: true,
			},
			
			proxy:{
				"/":{
					target:"http://localhost:9080",
					pathRewrite:{
						"/":"/1/5b07b8571f6cab002e832d23/static/",
					},
					changeOrigin:true,
				}
			},
			*/
		},
		plugins:[
			new ContextReplacementPlugin(/graphql-language-service-interface[\/\\]dist/, /\.js$/),
			new ContextReplacementPlugin(/transformation[\/\\]file/, /\.js$/),
			new ContextReplacementPlugin(/source-map[\/\\]lib/, /\.js$/),
			//test for editor
			new HtmlWebpackPlugin({
				...HTML,
				fillname:"app.html",
				chunks:["app"]
			}),
			
			//test for site www
			new HtmlWebpackPlugin({
				filename: 'index.html',
				template:require.resolve('./www.tmpl'),
				chunks:["index"]
			}),
			
			new Visualizer({
				filename: 'stats.html'
			}),
		],
		watchOptions:{
			ignored: /node_modules\/(?!qili\-app|we\-edit|docx4js)/
		}
	}
}
