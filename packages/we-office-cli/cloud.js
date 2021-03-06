const path=require("path")
const fs=require('fs')
const {Cloud}=require("qili-cli")
const semver=require("semver")
const mkdirp=require("mkdirp")
const chalk=require("chalk")
const cwd=process.cwd()

module.exports=class extends Cloud{
	constructor(service="https://api.wenshubu.com/1/graphql"){
		super(service, "5b07b8571f6cab002e832d23")
	}

	publish(current, url, dir){
		const wo=current["we-office"]||{}
		const pluginName=wo.name||current.name
		const main=path.resolve(cwd,current.main||"index.js")
		return this.runQL("weOffice_plugin_Query",{name:pluginName})
			.then(({me:{plugin}})=>plugin)
			.then(latest=>{
				if(this.service.indexOf("localhost")!=-1 && url && dir){
					console.debug("dev environment, so just upload")
					return {
						key:`plugins/${pluginName}/${current.version}/index.js`,
						id:"Plugin:"+pluginName,
						creating:!latest
					}
				}

				if(!semver.valid(current.version)){
					throw new Error(`current version[${current.version}] is not  valid`)
				}

				if(latest && !semver.gt(current.version,latest.version)){
					throw new Error(`current version[${current.version}] must greater than last version[${latest.version}]`)
				}


				return this.runQL("file_token_Query")
					.then(({token})=>token)
					.then(({token,_id})=>{
						let id=latest ? latest.id : `Plugin:${_id}`
						return {
							key:`${id}/${current.version}/index.js`.replace(/\:/g,"/"),
							token,id,
							creating:!latest
						}
					})
			})
			.then(({token,key, id,creating})=>{
				return this.upload(main, token,key, {"x:id":id}, url, dir)
					.then(code=>({code,id,creating}))
			})
			.then(({code,id,creating})=>{
				let {name, version, description, readme, keywords,config}=current
				if(readme){
					try{
						readme=fs.readFileSync(path.resolve(cwd,readme),"utf-8")
					}catch(e){
						console.warn(chalk.yellow(`readme: ${e.message}`))
						console.debug(e)
					}
				}

				return this.runQL(
					creating ? "create_plugin_Mutation" : "plugin_update_Mutation",
					{code,id,name:pluginName, version, description,readme,keywords,config, ...wo}
				)
			})
	}

	upload(filePath, token, key, extra, url,dir){
		if(this.service.indexOf("localhost")!=-1 && url && dir){
			return this.upload4Test(...arguments)
		}

		const qiniu = require('qiniu')
		return new Promise((resolve,reject)=>
			qiniu.io.putFile(token,key,filePath ,extra,(err, ret)=>{
				if (!err) {
					if(ret.data.errors)
						reject(ret.data.errors)
					else
						resolve(ret.data.file_create.url)
				} else {
					reject(err)
				}
		  })
		)
	}

	upload4Test(filePath, token, key, extra, url,dir){
		try{
			console.log(`syncing ${key} plugin to ${dir} at ${url}`)
			dir=path.resolve(cwd,`${dir}/${key}`)
			mkdirp.sync(path.dirname(dir))
			fs.writeFileSync(dir,fs.readFileSync(filePath))
			return Promise.resolve(`${url}/${key}`)
		}catch(e){
			return Promise.reject(e)
		}
	}

	dev(be){
		return this.runQL("profile_setDeveloper_Mutation",{be})
	}
}

module.exports.NAME="wo"
