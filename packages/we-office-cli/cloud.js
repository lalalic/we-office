const path=require("path")
const fs=require('fs')
const {Cloud}=require("qili-cli")
const semver=require("semver")
const cwd=process.cwd()

module.exports=class extends Cloud{
	publish(current, url, dir){
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

				return this.upload(path.resolve(cwd,main), token,key, {"x:id":id}, url, dir)
					.then(code=>({code,id,creating}))
			})
			.then(({code,id,creating})=>{
				const {name, version, description, readme, keywords,config}=current
				if(readme){
					readme=fs.readFileSync(path.resolve(cwd,readme),"utf-8")
				}

				return this.runQL(
					creating ? "create_plugin_Mutation" : "plugin_update_Mutation",
					{code,id,name, version, description,readme,keywords,config}
				)
			})
	}

	upload(filePath, token, key, extra, url,dir){
		if(url && dir){
			return this.upload4Test(...arguments)
		}

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

	upload4Test(filePath, token, key, extra, url,dir){
		try{
			dir=path.resolve(cwd,`${dir}/${key}`)
			let routes=dir.split("/")
			routes.pop()
			routes.reduce((tested,a)=>{
				let current=[...tested,a].join("/")
				if(!fs.existsSync(current)){
					fs.mkdirSync(current)
				}
				return [...tested,a]
			},[])
			fs.writeFileSync(dir,fs.readFileSync(filePath))
			return Promise.resolve(`${url}/${key}`)
		}catch(e){
			return Promise.reject(e)
		}
	}
}
