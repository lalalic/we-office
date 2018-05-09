const PluginComment=Cloud.buildComment("Plugin")
const TransactionPagination=Cloud.buildPagination("Transaction")
const PluginPagination=Cloud.buildPagination("Plugin")

Cloud.typeDefs=`
	type Plugin implements Node{
		id:ID!
		name: String!
		description: String!
		version: String!
		code: String!
		author: User!
		free: Boolean!
		conf: JSON
		comments(parent: ObjectID, last: Int, before: JSON): PluginCommentConnection
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
		plugin_create(code:String!):Plugin
		plugin_update(_id:ObjectID!,code:String!):Plugin
		transaction_create(plugin:ObjectID!, type:String!, metrics: JSON!, amount:Float!):Boolean
		config_extensions(plugin:ObjectID!):User
	}
	
	extend type User{
		transactions(when:Date, plugin: ObjectID, first:Int, after: JSON): [Transaction]!
		extensions: [Plugin]!
		plugins:[Plugin]!
		balance:Float
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
					.map(({id,conf})=>app
						.getDataLoader("plugins")
						.load(id)
						.then(plugin=>({...plugin,conf}))
					)
			)
		},
		plugins(_,{},{app,user}){
			return app.findEntity("plugins",{author:user._id})
		},
		balance(){
			
		}
	},
	Mutation:{
		plugin_create(_,{code},{app,user}){
			try{
				const info=require("./check")(code)
				return app.createEntity("plugins",{...info,code,author:user._id})
			}catch(e){
				return Promise.reject(e)
			}
		},
		plugin_update(_,{code, _id},{app,user}){
			try{
				const info=require("./check")(code)
				return app.createEntity("plugins",{...info,code,author:user._id,_id})
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
			if(mine){
				return Cloud.resolver.User.plugins(...arguments)
			}
			return app.nextPage("plugins", {first,after}, cursor=>{
				if(type && type.length){
					cursor=cursor.filter({type:{$all:type}})
				}
				if(search){
					cursor=cursor.filter({description: new RegExp(`${search}.*`,"i")})
				}
				if(favorite){
					
				}
				return cursor
			})
		}
	},
	Plugin:{
		author({author},_,{app,user}){
			return app.getDataLoader("users").load(author)
		}
	}
})

Cloud.persistedQuery=require("./persisted-query")

module.exports=Cloud
