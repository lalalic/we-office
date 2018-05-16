import React, {Component, Fragment} from "react"
import {compose,mapProps, branch, renderComponent} from "recompose"

import {withFragment,withMutation,File, CommandBar} from "qili-app"
import {TextField} from "material-ui"
import {install} from "../plugin-loader"

import IconApply from "material-ui/svg-icons/content/add"

export class Plugin extends Component{
	state={code:this.props.plugin.code, info:this.props.plugin}

	render(){
		const {
			state:{code, info, installed, error},
			props:{save, buy, withdraw, plugin:{id, isMine,myConf}}
			}=this

		const cmdApply={
			action:"check",
			label:"Test",
			onSelect: ()=>this.check(code),
			icon: <IconApply/>
		}
		
		const cmdSave={
			action:"save",
			label:"Save",
			onSelect: ()=>save(code, info)
		}
		
		const cmdBuy={
			action:"buy",
			label:"buy",
			onSelect: ()=>buy(id)
		}
		
		const cmdWithdraw={
			action:"withdraw",
			label:"withdraw",
			onSelect: ()=>withdraw(id)
		}
		
		if(this.crc(code)==installed){
			cmdApply.icon=<IconApply color="green"/>
			cmdApply.label="Applied"
		}
		
		const actions=["back"]
		
		if(id){
			if(myConf){
				actions.push(cmdWithdraw)
			}else{
				actions.push(cmdBuy)
			}
		}
		
		if(isMine){
			actions.push(cmdApply)
			actions.push(cmdSave)
		}
		
		return (
			<Fragment>
				{isMine && 
				<div style={{flex:"1 100%", overflow: "scroll"}}>
					<textarea
						style={{
							width:"100%",height:"100%",
							border:"1px solid lightgray",padding:5,
							fontSize:"9pt",
							lineHeight:"10pt",
							fontFamily: "calibri"
						}}
						onChange={e=>this.setState({code:e.target.value})}
						defaultValue={code||start}
						/>
				</div>
				}

				<div style={{flex:1}}>
					<TextField name="name" floatingLabelText="name" disabled={true}
						errorText={error}
						fullWidth={true} value={name||info.name}/>
					<TextField name="description" floatingLabelText="description"  disabled={true}
						fullWidth={true} value={info.desc}/>
					<TextField name="version" floatingLabelText="version" disabled={true}
						fullWidth={true} value={info.ver}/>

					{info.conf && (
						<TextField name="conf" floatingLabelText="configuration"
							fullWidth={true}
							multiLine={true}
							value={JSON.stringify(myConf||info.conf)}
							/>
					)}
				</div>
				
				{!isMine && <div style={{flex:"1 100%", overflow: "scroll"}}></div>}
				
				<CommandBar 
					style={{flex:1}}
					items={actions}
					/>
			</Fragment>
		)
	}

	check(){
		install(this.state.code)
			.then(info=>{
				if(this.props.plugin.name && info.name!=this.props.plugin.name){
					throw new Error("name can't be changed")
				}
				
				this.setState({info, installed:this.crc(this.state.code),error:undefined})
			})
			.catch(e=>this.setState({error:e.message}))
	}
	
	crc(code){
		return code
	}
}

export default compose(
	withFragment(graphql`fragment plugin_plugin on Plugin{
		id
		name
		desc
		ver
		conf
		code

		isMine
		myConf
	}`),
	withMutation(({plugin:{id}})=>({
		name:"buy",
		patch4:id,
		variables:{id},
		mutation:graphql`mutation plugin_buy_Mutation($id:ObjectID!,$ver:String,$conf:JSON){
			buy_plugin(_id:$id,ver:$ver, conf:$conf){
				myConf
			}
		}`,
	})),
	withMutation(({plugin:{id}})=>({
		name:"withdraw",
		patch4:id,
		variables:{id},
		mutation:graphql`mutation plugin_withdraw_Mutation($id:ObjectID!,$ver:String,$conf:JSON){
			withdraw_plugin(_id:$id, ver:$ver, conf:$conf){
				myConf
			}
		}`,
	})),	
	withMutation(({plugin:{id}})=>({
		name:"update",
		patch4:id,
		variables:{id},
		mutation:graphql`mutation plugin_create_Mutation($id:ObjectID!,$code:URL!,$desc:String,$ver:String,$conf:JSON){
			plugin_update(_id:$id, code:$code, desc:$desc, ver:$ver, conf:$conf){
				...plugin_plugin
			}
		}`,
	})),
	File.withUpload,
	mapProps(({plugin,update,upload, buy, withdraw})=>({
		save(code,info){
			return upload(code,plugin.id,`${info.ver}/index.js`)
				.then(({url})=>update({...info,code:url}))
		},
		plugin, buy, withdraw
	}))
)(Plugin)

const start=`//A we-edit Loader plugin to load input
/*
	const {Component, createElement}=require("react")
	const PropTypes=require("prop-types")
	const {Loader}=require("we-edit")

	class MyLoader extends Component{
		render(){
			return createElement("div",{},"hello Loader!")
		}
	}
	MyLoader.propTypes={
		type: PropTypes.string.isRequired
	}

	MyLoader.defaultProps={
		type:"MyLoader"
	}

	Loader.support(MyLoader)
	exports.name="MyLoader"
	exports.ver="0.0.1"
	exports.desc="test"
*/
`

