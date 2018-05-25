const path=require("path")
const QiliCloud=require("qili-cli/qili-cloud")
const semver=require("semver")
const cwd=process.cwd()

class Cloud extends QiliCloud{
	publish(current){
		return this.runQL("weOffice_plugin_Query",{name:current.name})
			.then(({data:{plugin}})=>plugin)
			.then(latest=>{
				if(latest && !semver.gt(current.version,latest.version)){
					throw new Error("latest version is "+latest.version)
				}
				semver.valid(current.version)
				
				return this.runQL("file_token_Query")
					.then(({data:{token}})=>token)
					.then(({token,_id})=>{
						let id=latest ? latest.id : `plugins:${_id}`
						return {key:`${id}/${current.version}/index.js`.replace(/\:/g,"/"),token,id, creating:!!latest}
					})
			})
			.then(({token,key, id,creating})=>{
				let main=current.main||"index.js"
				
				return this.upload(path.resolve(cwd,main), token,key, {"x:id":id})
					.then(code=>({code,id,creating}))
			})
			.then(({code,id,creating})=>{
				const {name, version, description, readme, keywords,config}=current
				if(readme){
					readme=file.readFileSync(path.resolve(cwd,readme),"utf-8")
				}
					
				return this.runQL(
					creating ? "create_plugin_Mutation" : "plugin_update_Mutation",
					{code,id,name, version, description,readme,keywords,config}
				)
			})
	}
	
	upload(filePath, token, key, extra){
		const qiniu = require('qiniu')
		return new Promise((resolve,reject)=>
			qiniu.io.putFile(token,key,filePath ,extra,(err, ret)=>{
				if (!err) {
					let url=JSON.parse(ret.returnBody).data.file_create.url
					resolve(url)
				} else {
					reject(err)
				}
		  })
		)
	}
}

module.exports=Cloud