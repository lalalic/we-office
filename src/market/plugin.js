import React, {Component, Fragment} from "react"
import PropTypes from "prop-types"
import {compose,mapProps,getContext} from "recompose"

import {withFragment,withMutation} from "qili-app/graphql"
import CommandBar from "qili-app/components/command-bar"
import TextField from "material-ui/TextField"
import {ACTION} from "../state"

export class Plugin extends Component{
	render(){
		const {buy, withdraw, plugin:{isMine,using, name,description,version}}=this.props


		const cmdBuy={
			action:"buy",
			label:"buy",
			onSelect: buy
		}

		const cmdWithdraw={
			action:"withdraw",
			label:"withdraw",
			onSelect: withdraw
		}

		const actions=["back"]

		if(using){
			actions.push(cmdWithdraw)
		}else{
			actions.push(cmdBuy)
		}

		return (
			<Fragment>
				<div style={{flex:1}}>
					<TextField name="name" floatingLabelText="name" disabled={true}
						fullWidth={true} value={name}/>
					<TextField name="description" floatingLabelText="description"  disabled={true}
						fullWidth={true} value={description}/>
					<TextField name="version" floatingLabelText="latest version" disabled={true}
						fullWidth={true} value={version}/>

					{using && (
						<Fragment>
							<TextField 
								name="using" 
								floatingLabelText={`using ${using.version||'latest version'}`}
								fullWidth={true}
								multiLine={true}
								value={using.config ? JSON.stringify(using.config) : ""}
								/>
						</Fragment>
					)}
				</div>

				<div style={{flex:"1 100%", overflow: "scroll"}}></div>

				<CommandBar
					style={{flex:1}}
					items={actions}
					/>
			</Fragment>
		)
	}
}

export default compose(
	withFragment({plugin:graphql`fragment plugin_plugin on Plugin{
		id
		name
		description
		version
		config
		code
		history{
			version
		}

		isMine
		using
	}`}),
	withMutation(({plugin:{id,version}}, data)=>({
		name:"buy",
		patch4:id,
		variables:{id},
		patchData:{using:true},
		mutation:graphql`mutation plugin_buy_Mutation($id:ObjectID!,$version:String,$config:JSON){
			buy_plugin(_id:$id,version:$version, config:$config){
				extensions{
					...weOffice_extension @relay(mask: false)
				}
			}
		}`,
	})),
	withMutation(({plugin:{id}})=>({
		name:"withdraw",
		variables:{id},
		patch4:id,
		patchData:{using:null},
		mutation:graphql`mutation plugin_withdraw_Mutation($id:ObjectID!,$version:String,$config:JSON){
			withdraw_plugin(_id:$id, version:$version, config:$config){
				extensions{
					...weOffice_extension @relay(mask: false)
				}
			}
		}`,
	})),
	getContext({store:PropTypes.object}),
	mapProps(({plugin, buy, withdraw,store, dispatch=store.dispatch})=>({
		plugin,
		buy(){
			return buy(...arguments)
				.then(data=>dispatch(ACTION.EXTENSIONS(data.extensions)))
		},
		withdraw(){
			return withdraw(...arguments)
				.then(data=>dispatch(ACTION.EXTENSIONS(data.extensions)))
		}
	}))
)(Plugin)
