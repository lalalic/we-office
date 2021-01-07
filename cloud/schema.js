module.exports=`
type Plugin implements Node{
    id:ID!
    name: String!
    description: String!
    version: String!
    author: User!
    config: JSON
    code: URL!
    readme: String
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
    Dashboard
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
    plugin_update(_id:ObjectID!,code:URL!,name:String,readme:String,keywords:[String],type:[PluginType],description:String,version:String,config:JSON):Plugin
    buy_plugin(_id:ObjectID!, version:String, config:JSON):User
    withdraw_plugin(_id:ObjectID!, version:String, config:JSON):User
    user_setDeveloper(be:Boolean!):User
    document_session(doc:String!,action:JSON!):Boolean
    checkout_document(id:String!):Document
    checkin_document(id:String!):Document
    share_document(id:String!, to:String!):Document
    delete_document(id:String!):Boolean
    save_document(id:String!):FileToken
    unshare_document(id:String!, to:String):Document
}

extend type User{
    extensions: [Plugin]!
    plugins:[Plugin]!
    plugin(_id:ObjectID, name:String): Plugin
    isDeveloper: Boolean
    documents(filter:String): [Document]
    document(id:String): Document
}

extend type Subscription{
    document_session(doc:String!):DocumentUpdate
}

type DocumentUpdate{
    doc: String
    worker: User
    action: JSON
}

type Document{
    id: String
    name: String
    type: String
    url: URL
    checkoutBy: User
    shareBy: User
    isMine: Boolean
    checkouted: Boolean
    checkoutByMe: Boolean
    shared: Boolean
    workers: [User]
}
`