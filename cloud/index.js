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
				...plugin_plugin
				id
			  }
			}
	
			fragment plugin_plugin on Plugin {
			  id
			  name
			  description
			  version
			  config
			  code
			  history {
				version
				id
			  }
			  isMine
			  using
			}
			`,
		},require("./persisted-query")),
	indexes:{
		Plugin:[{name:1}],
	}
})

module.exports=Cloud
