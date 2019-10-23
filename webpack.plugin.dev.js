const example="we-edit-input-xlsx"
module.exports=(base)=>{
	return {
		...base,
		entry:`./examples/${example}/.dev.js`,
		/*
		(){
			return new Promise((resolve,reject)=>{
				const ctx="./examples/src"
				require("fs").readdir(ctx,(error, files)=>{
					if(error){
						reject(error)
					}else{
						console.dir(files)
						resolve(files.reduce((entries,a)=>{
							if(a.endsWith(".js")){
								entries[a.substr(0,a.length-3)]=`${ctx}/${a}`
							}else if(a.indexOf(".")==-1){
								entries[a]=`${ctx}/${a}/index.js`
							}
							return entries
						},{}))
					}
				})	
			})
		},*/
		devtool:"source-map",
		mode:"development",
		node:{
			fs: "empty"
		},
		devServer:{
			contentBase: path.join(__dirname, "examples/"+example),
			port:9093,
			host:"0.0.0.0",
			before(app){
				app.get("/font-service.js", (req,res)=>{
					res.set({ 'Content-Type': 'application/javascript; charset=utf-8' });
                	res.send(require("fs").readFileSync(path.join(__dirname, 'node_modules/we-edit/font-service.js')));
				})

				app.get("/fonts/Arial", (req,res)=>{
					res.set({ 'Content-Type': 'font' });
                	res.send(require("fs").readFileSync(path.join(__dirname, 'node_modules/we-edit/Arial')));
				})
			}
		},
	}
}
