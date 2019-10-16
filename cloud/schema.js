module.exports=`
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
    type:[PluginType]

    using: JSON
    isMine: Boolean
}

enum PluginType{
    Input
    Loader
    Emitter
    Stream
    Representation
    Office
}

type Anonymous{
    plugins(type:[PluginType], searchText:String, first:Int, after:JSON):PluginConnection
    plugin(_id:ObjectID, name:String): Plugin
    plugins_count:Int
}

extend type Query{
    plugins(type:[PluginType], mine: Boolean, favorite: Boolean, using:Boolean, searchText:String, first:Int, after:JSON):PluginConnection
    anonymous:Anonymous!
}

extend type Mutation{
    plugin_update(_id:ObjectID!,code:URL!,name:String,readme:String,keywords:[String],type:[PluginType],
        description:String,version:String,config:JSON):Plugin
    buy_plugin(_id:ObjectID!, version:String, config:JSON):User
    withdraw_plugin(_id:ObjectID!, version:String, config:JSON):User
    user_setDeveloper(be:Boolean!):User
}

extend type User{
    extensions: [Plugin]!
    plugins:[Plugin]!
    plugin(_id:ObjectID, name:String): Plugin
    isDeveloper: Boolean
}
`