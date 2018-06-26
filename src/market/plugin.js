import React, {Component, Fragment} from "react"
import PropTypes from "prop-types"
import {compose,mapProps, branch, renderComponent,getContext} from "recompose"

import {withFragment,withMutation,File, CommandBar} from "qili-app"
import {TextField} from "material-ui"
import {install} from "../plugin-loader"
import {ACTION} from "../state"

import IconApply from "material-ui/svg-icons/content/add"

export class Plugin extends Component{
	state={info:this.props.plugin}

	render(){
		const {
			state:{info, installed, error},
			props:{save, buy, withdraw, plugin:{isMine,myConf, bought}, isNew}
			}=this

		const cmdApply={
			action:"check",
			label:"Test",
			onSelect: ()=>this.test(),
			icon: <IconApply/>
		}


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

		if(!isNew){
			if(bought){
				actions.push(cmdWithdraw)
			}else{
				actions.push(cmdBuy)
			}
		}

		if(isMine){
			actions.push(cmdApply)
		}

		return (
			<Fragment>
				<div style={{flex:1}}>
					<TextField name="name" floatingLabelText="name" disabled={true}
						errorText={error}
						fullWidth={true} value={name||info.name}/>
					<TextField name="description" floatingLabelText="description"  disabled={true}
						fullWidth={true} value={info.description}/>
					<TextField name="version" floatingLabelText="version" disabled={true}
						fullWidth={true} value={info.version}/>

					{info.config && (
						<TextField name="config" floatingLabelText="configuration"
							fullWidth={true}
							multiLine={true}
							value={JSON.stringify(myConf||info.config)}
							/>
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

	test(){
		File.selectTextFile()
			.then(code=>install({...this.props.plugin,code}))
			.catch(e=>this.setState({error:e.message}))
	}
}

export default compose(
	withFragment(graphql`fragment plugin_plugin on Plugin{
		id
		name
		description
		version
		config
		code

		isMine
		myConf
		bought
	}`),
	withMutation(({plugin:{id}})=>({
		name:"buy",
		patch4:id,
		variables:{id},
		patch4:id,
		patchData:{bought:true},
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
		patchData:{bought:false},
		mutation:graphql`mutation plugin_withdraw_Mutation($id:ObjectID!,$version:String,$config:JSON){
			withdraw_plugin(_id:$id, version:$version, config:$config){
				extensions{
					...weOffice_extension @relay(mask: false)
				}
			}
		}`,
	})),
	withMutation(({plugin:{id}})=>({
		name:"update",
		variables:{id},
		mutation:graphql`mutation plugin_update_Mutation($id:ObjectID!,$code:URL!,$type:[PluginType],
			$description:String,$version:String,$config:JSON,$readme:String, $keywords:[String]){
			plugin_update(_id:$id, code:$code,type:$type,
				description:$description, version:$version, config:$config,readme:$readme, keywords:$keywords){
				...plugin_plugin
			}
		}`,
	})),
	getContext({store:PropTypes.object}),
	File.withUpload,
	mapProps(({plugin,update,upload, buy, withdraw,store, dispatch=store.dispatch})=>({
		save(code,info){
			return upload(code,plugin.id,`${info.version}/index.js`)
				.then(({url})=>update({...info,code:url}))
		},
		plugin,
		buy(){
			return buy(...arguments)
				.then(data=>dispatch(ACTION.EXTENSIONS(data.extensions)))
		},
		withdraw(){
			return withdraw(...arguments)
				.then(data=>dispatch(ACTION.EXTENSIONS(data.extensions)))
		},
		isNew: !!!plugin.id
	}))
)(Plugin)
