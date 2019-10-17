const path = require('path')

module.exports=(base)=>{
	return {
		entry:"src/index.js",
		devtool:"inline-source-map",
		mode:"production",
		output:{
			path:`${__dirname}/dist`,
			filename:"[name].js",
			libraryTarget:"commonjs2"
		},
		externals:"react,react-dom,material-ui,prop-types,we-edit,react-redux,recompose,stream, readable-stream"
				.split(",")
				.reduce((cols,a)=>{
					cols[a]="commonjs2 "+a
					return cols
				},{})
	}
}
