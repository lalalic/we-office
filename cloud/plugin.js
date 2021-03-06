module.exports={
	User:{
		extensions(_,{},{app,user}){
			const loader=app.getDataLoader("Plugin")
			return Promise.all(
				(user.extensions||[])
					.map(({_id,version,config})=>
						loader
							.load(_id)
							.then(a=>{
								if(a){
									if(version && version!==a.version){
										a.code=a.code.replace(a.version,version)
									}
									a.version=version||a.version
									a.config=config||a.config
								}
								return a
							})
					)
			)
			.then(all=>all.filter(a=>!!a))
			.then(all=>{
				const i=a=>(a.type||[]).findIndex(t=>t=="Representation")
				return all.sort((a,b)=>i(b)-i(a))
			})
		},
		plugins(_,{},{app,user}){
			if(!user.isDeveloper)
				return []
			return app.findEntity("Plugin",{author:user._id})
		},
		plugin(_,{_id,name},{app,user}){
			let cond={}
			if(_id)
				cond._id=_id
			else if(name)
				cond.name=name
			else
				return null

			return app.get1Entity("Plugin",cond)
		},
	},
	Mutation:{
		plugin_update(_,{_id, code, name, ...info},{app,user}){
			if(!user.isDeveloper){
				return Promise.reject("Please apply for as developer in your we-office account.")
			}

			return app
				.get1Entity("Plugin",{_id,author:user._id})
				.then(a=>{
					if(a){
						if(name && a.name!=name){
							return Promise.reject("name can't be changed in new version")
						}

						let _history=a.history||[]

						return app
							.patchEntity(
								"Plugin",
								{_id,author:user._id},
								{...info,
									code,
									history:[..._history,{version:a.version,config:a.config,createdAt:a.updatedAt||a.createdAt}]
								}
							)
							.then(()=>app.get1Entity("Plugin",{_id}))
					}else{
						return app.get1Entity("Plugin",{name})
							.then(b=>{
								if(b){
									return Promise.reject(`plugin[${name}] already exists.`)
								}else{
									return app.createEntity("Plugin",{...info,author:user._id,_id,code,name})
								}
							})

					}
				})
		},
		buy_plugin(_,{_id,version, config},{app,user}){
			let extensions=user.extensions||[]
			let i=extensions.findIndex(a=>a._id==_id)
			if(i==-1){
				extensions.push({_id,version,config})
			}else{
				extensions.splice(i,1,{_id,version,config})
			}
			return app.patchEntity("User", {_id:user._id}, {extensions})
				.then(()=>{
					user.extensions=extensions
					return user
				})
		},
		withdraw_plugin(_,{_id},{app,user}){
			let extensions=user.extensions||[]
			let i=extensions.findIndex(a=>a._id==_id)
			if(i==-1){
				return true
			}else{
				extensions.splice(i,1)
			}
			return app.patchEntity("User", {_id:user._id}, {extensions})
				.then(()=>{
					user.extensions=extensions
					return user
				})
		},
		user_setDeveloper(_,{be},{app,user}){
			return app.patchEntity("User",{_id:user._id},{isDeveloper:be})
				.then(()=>({_id:user._id, isDeveloper:be}))
		},
	},
	Anonymous:{
		plugins(_,{type,searchText,first,after},{app}){
			const query={first,after}
			if(type && type.length){
				query.type={$all:type}
			}
			if(searchText){
				query.description=new RegExp(`${searchText}.*`,"i")
			}
			return app.nextPage("Plugin", query)
		},
		plugins_count(){
			return 9
		},

		plugin(_,{_id,name},{app}){
			let cond={}
			if(_id)
				cond._id=_id
			else if(name)
				cond.name=name
			else
				return null

			return app.get1Entity("Plugin",cond)
		}
	},
	Query:{
		plugins(_,{type,searchText,mine,favorite,using,first,after},{app,user}){
			if(using){
				const loader=app.getDataLoader("Plugin")
				return Promise.all((user.extensions||[]).map(({_id})=>loader.load(_id)))
					.then(all=>all.filter(a=>!!a))
					.then(edges=>({edges,hasNextPage:false}))
			}
			const query={first,after}
			if(type && type.length){
				query.type={$all:type}
			}
			if(searchText){
				query.description=new RegExp(`${searchText}.*`,"i")
			}

			if(mine){
				query.author=user._id
			}
			if(favorite){

			}

			return app.nextPage("Plugin", query)
		},
		anonymous(){
			return {}
		}
	},
	Plugin:{
		id:Cloud.ID,
		author({author},_,{app,user}){
			return app.getDataLoader("User").load(author)
		},
		isMine({author},_,{user}){
			return user.isDeveloper && user._id==author
		},
		using({_id},{},{user:{extensions}}){
			let found=(extensions||[]).find(a=>a._id==_id)
			if(found){
				return {
					config:found.config,
					version:found.version
				}
			}
			return null
		}
	},
}