module.exports=(base)=>{
	return {
		entry:{
			"code-mirror":`./examples/src/code-mirror.js`
		},
		//devtool:"inline-source-map",
		mode:"production",
		output:{
			path:`${__dirname}/dist/example/plugins`,
			filename:"[name].js",
			libraryTarget:"commonjs2"
		},
		module:base.module,
		externals:"react,react-dom,material-ui,prop-types,we-edit,react-redux,recompose,stream, readable-stream"
				.split(",")
				.reduce((cols,a)=>{
					cols[a]="commonjs2 "+a
					return cols
				},{})
	}
}
