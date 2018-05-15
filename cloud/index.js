const PluginComment=Cloud.buildComment("Plugin")
const TransactionPagination=Cloud.buildPagination("Transaction")
const PluginPagination=Cloud.buildPagination("Plugin")

Cloud.typeDefs=`
	
	type Plugin implements Node{
		id:ID!
		name: String!
		desc: String!
		ver: String!
		author: User!
		conf: JSON
		code: URL!
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
		plugins(type:[PluginType], mine: Boolean, favorite: Boolean, search:String, first:Int, after:JSON):PluginConnection
	}
	
	extend type Mutation{
		plugin_update(_id:ObjectID!,code:URL!,name:String,desc:String,ver:String,conf:JSON):Plugin
		transaction_create(plugin:ObjectID!, type:String!, metrics: JSON!, amount:Float!):Boolean
		config_extensions(plugin:ObjectID!):User
	}
	
	extend type User{
		transactions(when:Date, plugin: ObjectID, first:Int, after: JSON): [Transaction]!
		extensions: [Plugin]!
		plugins:[Plugin]!
		balance:Float
		plugin(_id:ObjectID): Plugin
	}
	
	type Transaction{
		id: ID!
		plugin: ID!
		type: String!
		metrics: JSON!
		amount: Float!
	}
	${PluginComment.typeDefs}
	${PluginPagination.typeDefs}
	${TransactionPagination.typeDefs}
`

Cloud.resolver=Cloud.merge(
	PluginComment.resolver, 
	TransactionPagination.resolver,
	PluginPagination.resolver,
	{
	User:{
		transactions(){
			
		},
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
			return app.findEntity("plugins",{author:user._id})
		},
		balance(){
			
		},
		plugin(_,{_id},{app,user}){
			return app
				.getDataLoader("plugins")
				.load(_id)
		}
	},
	Mutation:{
		plugin_update(_,{_id, ...info},{app,user}){
			try{
				
				return app
					.get1Entity("plugins",{_id,author:user._id})
					.then(a=>{
						if(a){
							if(a.name!=info.name){
								return Promise.reject(new Error("name can't be changed in new version"))
							}
							let {_id:__id,history:_history, name:_name, ...last}=a
							let updated={...a,...info,history:[...a.history,last]}
							return app.updateEntity("plugin",{_id,author:user._id},updated)
						}else{
							return app.createEntity("plugins",{...info,author:user._id,_id})
						}
					})
					
			}catch(e){
				return Promise.reject(e)
			}
		},
		transaction_create(){
			
		},
		config_extensions(_,{extensions},{app,user}){
			return app.patchEntity("users",{_id:user._id},{extensions})
		}
	},
	Query:{
		plugins(_,{type,search,mine,favorite,first,after},{app,user}){
			return app.nextPage("plugins", {first,after}, cursor=>{
				if(type && type.length){
					cursor=cursor.filter({type:{$all:type}})
				}
				if(search){
					cursor=cursor.filter({description: new RegExp(`${search}.*`,"i")})
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
			return user._id==author
		},
		myConf({_id},{},{user}){
			let selected=(user.extensions||[]).find(a=>a._id==id)
			if(selected)
				return selected.conf||{}
			return null
		}
	}
})

Cloud.persistedQuery=require("./persisted-query")

module.exports=Cloud
