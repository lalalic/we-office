const PluginComment=Cloud.buildComment("Plugin")
const TransactionPagination=Cloud.buildPagination("Transaction")

Cloud.typeDefs=`
	type Plugin implements Node{
		id:ID!
		name: String!
		description: String!
		version: String!
		code: String!
		author: String!
		free: Boolean!
		conf: JSON
	}
	
	extend type Mutation{
		plugin_create(name:String!,description:String!,version:String!,code:String!,author:String!,free:Boolean!):Plugin
		plugin_update(name:String,description:String,version:String,code:String,author:String,free:Boolean):Plugin
		transaction_create(plugin:ID!, type:String!, metrics: JSON!, amount:float!):Boolean
		config_extensions():User
	}
	
	extend type User{
		transactions(when:Date, plugin: ID, first:Int, after: JSON): [Transaction]!
		extensions: [Plugin]!
		plugins:[Plugin]!
		balance:float
	}
	
	type Transaction{
		id: ID!
		plugin: ID!
		type: String!
		metrics: JSON!
		amount: float!
	}
	${PluginComment.typeDefs}
	${TransactionPagination.typeDefs}
`

Cloud.resolver=Cloud.merge(PluginComment.resolver, TransactionPagination.resolver,{
	User:{
		transactions(){
			
		},
		extensions(){
			
		},
		plugins(){
			
		},
		balance(){
			
		}
	},
	Mutation:{
		plugin_create(){
			
		},
		plugin_update(){
			
		},
		transaction_create(){
			
		},
		config_extensions(){
			
		}
	}
})

Cloud.persistedQuery=require("./persisted-query")

module.exports=Cloud
