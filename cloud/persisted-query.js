//generated from persisted-query.js, don't edit it
module.exports={
	"create_plugin_Mutation":`mutation create_plugin_Mutation(
		  $id: ObjectID!
		  $code: URL!
		  $name: String
		  $desc: String
		  $ver: String
		  $conf: JSON
		) {
		  plugin_update(_id: $id, code: $code, name: $name, desc: $desc, ver: $ver, conf: $conf) {
		    ...plugin_plugin
		    id
		  }
		}
		
		fragment plugin_plugin on Plugin {
		  id
		  name
		  desc
		  ver
		  conf
		  isMine
		  myConf
		}
		`,
	"plugin_create_Mutation":`mutation plugin_create_Mutation(
		  $id: ObjectID!
		  $code: URL!
		  $desc: String
		  $ver: String
		  $conf: JSON
		) {
		  plugin_update(_id: $id, code: $code, desc: $desc, ver: $ver, conf: $conf) {
		    ...plugin_plugin
		    id
		  }
		}
		
		fragment plugin_plugin on Plugin {
		  id
		  name
		  desc
		  ver
		  conf
		  isMine
		  myConf
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
		        desc
		        ver
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
	"weOffice_plugin_Query":`query weOffice_plugin_Query(
		  $id: ObjectID
		) {
		  me {
		    plugin(_id: $id) {
		      ...plugin_plugin
		      id
		    }
		    id
		  }
		}
		
		fragment plugin_plugin on Plugin {
		  id
		  name
		  desc
		  ver
		  conf
		  isMine
		  myConf
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
		      code
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