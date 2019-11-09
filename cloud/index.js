const PluginComment=Cloud.buildComment("Plugin")
const PluginPagination=Cloud.buildPagination("Plugin")

Cloud.addModule({
	typeDefs:`
		${require("./schema")}
		${PluginComment.typeDefs}
		${PluginPagination.typeDefs}
	`,

	resolver:Cloud.merge(
		PluginComment.resolver,
		PluginPagination.resolver,
		require("./resolver"),
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
		service.on(/.*/,require("../src/www/server").default)
	},
})

Cloud.logVariables=function(variables){
	
}
module.exports=Cloud
