const DocumentsPubSub=require("./pubsub").default
const PluginComment=Cloud.buildComment("Plugin")
const PluginPagination=Cloud.buildPagination("Plugin")

Cloud.addModule({
	name:"we-office",
	typeDefs:`
		${require("./schema")}
		${PluginComment.typeDefs}
		${PluginPagination.typeDefs}
	`,

	resolver:Cloud.merge(
		PluginComment.resolver,
		PluginPagination.resolver,
		require("./plugin"),
		require("./document"),
	),

	persistedQuery:Object.assign({
		"plugin_update_Mutation":`mutation plugin_update_Mutation(
			  $id: ObjectID!
			  $code: URL!
			  $name: String
			  $readme: String
			  $keywords: [String]
			  $type: [PluginType]
			  $description: String
			  $version: String
			  $config: JSON
			) {
			  plugin_update(_id: $id, code: $code, name: $name, readme: $readme, keywords: $keywords, type: $type, description: $description, version: $version, config: $config) {
				version
				name
			  }
			}
			`,
		},require("./persisted-query")),
	indexes:{
		Plugin:[{name:1}],
	},
	static(service){
		service.on(/document\/(?<doc>.*)/,function({app,user,params:{doc}}, res){
			const stream=app.pubsub.getDocumentSession(doc).getStream({app,user})
			res.reply(stream)
		})

		service.on(/.*/,require("../src/www/server").default)
	},

	init(cloud){
		cloud.pubsub=new DocumentsPubSub(cloud.pubsub)
	}
})

Cloud.logVariables=function(variables){
	
}

module.exports=Cloud
