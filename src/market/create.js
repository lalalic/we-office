import {Plugin} from "./plugin"
import {compose, mapProps} from "recompose"
import {withMutation, File} from "qili-app"

export default compose(
	withMutation({
		name:"create",
		mutation:graphql`mutation create_plugin_Mutation($id:ObjectID!,$name:String!,$code:URL!,$type:[PluginType],
			$description:String,$version:String,$config:JSON,$readme:String, $keywords:[String]){
			plugin_update(_id:$id, name:$name, code:$code, type:$type,
				description:$description, version:$version, config:$config,readme:$readme, keywords:$keywords){
				...plugin_plugin
			}
		}`,
	}),
	File.withUpload,
	mapProps(({create, upload,getToken,toPlugin, goBack})=>({
		save(code,info){
			return getToken()
				.then(({token,_id})=>{
					let id=`plugins:${_id}`
					return upload(code,id,`${info.ver}/index.js`,token)
						.then(({url})=>create({...info,id,code:url}))
						.then(()=>{
							toPlugin(id)
						})
				})
		},
		plugin:{
			isMine:true,
			code:"",
		},
		goBack
	}))
)(Plugin)
