//generated from persisted-query.js, don't edit it
module.exports={
	"create_plugin_Mutation":`mutation create_plugin_Mutation(
		  $code: String!
		) {
		  plugin_create(code: $code) {
		    ...plugin_data
		    id
		  }
		}
		
		fragment plugin_data on Plugin {
		  id
		  name
		  description
		  version
		  free
		  conf
		}
		`,
	"plugin_update_Mutation":`mutation plugin_update_Mutation(
		  $id: ObjectID!
		  $code: String!
		) {
		  plugin_update(_id: $id, code: $code) {
		    ...plugin_data
		    id
		  }
		}
		
		fragment plugin_data on Plugin {
		  id
		  name
		  description
		  version
		  free
		  conf
		}
		`,
	"weOffice_plugins_Query":`query weOffice_plugins_Query(
		  $type: [PluginType]
		  $mine: Boolean
		  $favorite: Boolean
		  $search: String
		  $count: Int = 20
		  $cursor: JSON
		) {
		  ...list_plugins
		}
		
		fragment list_plugins on Query {
		  plugins(type: $type, mine: $mine, favorite: $favorite, search: $search, first: $count, after: $cursor) {
		    edges {
		      node {
		        id
		        name
		        description
		        version
		        author {
		          username
		          id
		        }
		        __typename
		      }
		      cursor
		    }
		    pageInfo {
		      hasNextPage
		      endCursor
		    }
		  }
		}
		`,
	"weOffice_prefetch_Query":`query weOffice_prefetch_Query {
		  me {
		    id
		    token
		    username
		    photo
		    extensions {
		      id
		      conf
		    }
		  }
		}
		`,
	"weOffice_profile_Query":`query weOffice_profile_Query {
		  me {
		    id
		    username
		    birthday
		    gender
		    location
		    photo
		    signature
		  }
		}
		`
}