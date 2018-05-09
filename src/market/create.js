import {Plugin} from "./plugin"
import {compose} from "recompose"
import {withMutation} from "qili-app"

export default compose(
	withMutation(({},code)=>({
		name:"create",
		variables:{code},
		mutation:graphql`mutation create_plugin_Mutation($code:String!){
			plugin_create(code:$code){
				...plugin_data
			}
		}`,
	})),
	mapProps(({create})=>({
		update(code){
			return create(code)
		}
	}))
)(Plugin)