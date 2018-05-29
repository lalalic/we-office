const PluginComment=Cloud.buildComment("Plugin")
const PluginPagination=Cloud.buildPagination("Plugin")

Cloud.typeDefs=`
	type Plugin implements Node{
		id:ID!
		name: String!
		description: String!
		version: String!
		author: User!
		config: JSON
		code: URL!
		readme: String!
		keywords: [String]
		history: [Plugin]
		
		myConf: JSON
		isMine: Boolean
	}
	
	enum PluginType{
		Loader
		Emitter
		Output
		Representation
		Ribbon
	}
	
	extend type Query{
		plugins(type:[PluginType], mine: Boolean, favorite: Boolean, using:Boolean, searchText:String, first:Int, after:JSON):PluginConnection
	}
	
	extend type Mutation{
		plugin_update(_id:ObjectID!,code:URL!,name:String,readme:String,keywords:[String],
			description:String,version:String,config:JSON):Plugin
		buy_plugin(_id:ObjectID!, version:String, config:JSON):Plugin
		withdraw_plugin(_id:ObjectID!, version:String, config:JSON):Plugin
		user_setDeveloper(be:Boolean!):User
	}
	
	extend type User{
		extensions: [Plugin]!
		plugins:[Plugin]!
		plugin(_id:ObjectID, name:String): Plugin
		isDeveloper: Boolean
	}
	
	${PluginComment.typeDefs}
	${PluginPagination.typeDefs}
`

Cloud.resolver=Cloud.merge(
	PluginComment.resolver, 
	PluginPagination.resolver,
	{
	User:{
		extensions(_,{},{app,user}){
			return Promise.all(
				(user.extensions||[])
					.map(({_id,conf})=>app
						.getDataLoader("plugins")
						.load(_id)
						.then(plugin=>({...plugin,conf}))
					)
			)
		},
		plugins(_,{},{app,user}){
			if(!user.isDeveloper)
				return []
			return app.findEntity("plugins",{author:user._id})
		},
		plugin(_,{_id,name},{app,user}){
			let cond={}
			if(_id)
				cond._id=_id
			else if(name)
				cond.name=name
			else
				return null
			
			return app.get1Entity("plugins",cond)
		}
	},
	Mutation:{
		plugin_update(_,{_id, code, name, ...info},{app,user}){
			if(!user.isDeveloper)
				return Promise.reject()
			
			try{
				return app
					.get1Entity("plugins",{_id,author:user._id})
					.then(a=>{
						if(a){
							if(name && a.name!=name){
								return Promise.reject(new Error("name can't be changed in new version"))
							}
							
							let _history=a.history||[]

							return app
								.patchEntity(
									"plugin",
									{_id,author:user._id},
									{...info, 
										code, 
										history:[..._history,{version:a.version,config:a.config,createdAt:a.updatedAt||a.createdAt}]
									}
								)
						}else{
							return app.get1Entity("plugins",{name})
								.then(b=>{
									if(b){
										return Promise.reject(`plugin[${name}] already exists.`)
									}else{
										return app.createEntity("plugins",{...info,author:user._id,_id,code,name})
									}
								})
							
						}
					})
			}catch(e){
				return Promise.reject(e)
			}
		},
		buy_plugin(_,{_id,version, config},{app,user}){
			let extensions=user.extensions||[]
			let i=extensions.findIndex(a=>a._id==_id)
			if(i==-1){
				extensions.push({_id,version,config})
			}else{
				extensions.splice(i,1,{_id,version,config})
			}
			return app.patchEntity("users", {_id:user._id}, {extensions})
				.then(()=>({_id,config}))
				
		},
		withdraw_plugin(_,{_id},{app,user}){
			let extensions=user.extensions||[]
			let i=extensions.findIndex(a=>a._id==_id)
			if(i==-1){
				return true
			}else{
				extensions.splice(i,1)
			}
			return app.patchEntity("users", {_id:user._id}, {extensions})
				.then(()=>({_id,config:null}))
		},
		user_setDeveloper(_,{be},{app,user}){
			return app.patchEntity("users",{_id:user._id},{isDeveloper:be})
				.then(()=>({_id:user._id, isDeveloper:be}))
		}
	},
	Query:{
		plugins(_,{type,searchText,mine,favorite,using,first,after},{app,user}){
			if(using){
				return Cloud.resolver
					.User
					.extensions(user, {}, {app,user})
					.then(edges=>({edges,hasNextPage:false}))
			}
			
			return app.nextPage("plugins", {first,after}, cursor=>{
				if(type && type.length){
					cursor=cursor.filter({type:{$all:type}})
				}
				if(searchText){
					cursor=cursor.filter({description: new RegExp(`${searchText}.*`,"i")})
				}
				
				if(mine){
					cursor=cursor.filter({author:user._id})
				}
				
				if(favorite){
					
				}
				return cursor
			})
		}
	},
	Plugin:{
		id:({_id})=>`plugins:${_id}`,
		author({author},_,{app,user}){
			return app.getDataLoader("users").load(author)
		},
		isMine({author},_,{user}){
			return user.isDeveloper && user._id==author
		},
		myConf({_id},{},{user}){
			let selected=(user.extensions||[]).find(a=>a._id==_id)
			if(selected)
				return selected.config||{}
			return null
		}
	}
})

Cloud.persistedQuery=require("./persisted-query")

Cloud.indexes={
	plugins:[
		{name:1}
	]
}

module.exports=Cloud
