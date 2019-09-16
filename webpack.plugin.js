const path = require('path')
const {DllPlugin} = require("webpack")

module.exports=(base)=>{
	return {
		entry: {
			vendor: [
			  'react',
			  'react-dom',
			  'redux',
			  'react-redux',
			  'react-router',
			  'redux-thunk',
			  'material-ui',
			  "we-edit",
			  "recompose",
			  "prop-types"
			],
		},
		output:{
			...base.output,
			filename:"[name].js"
		},
		module:base.module,
		plugins:[
			new DllPlugin({
				context: __dirname,
				name: "[name]_[hash]",
				path: path.join(__dirname, "manifest.json"),				
			})
		]
	}
}
