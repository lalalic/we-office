import React, {Component, Fragment} from "react"
import {compose,mapProps} from "recompose"

import {withFragment,withMutation,File, CommandBar} from "qili-app"
import {TextField} from "material-ui"
import {install} from "../plugin-loader"

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

export class Plugin extends Component{
	state={code:this.props.plugin.code, info:this.props.plugin}

	render(){
		const {state:{code, info},props:{save, plugin:{isMine,myConf,name}}}=this
		return (
			<Fragment>
				<div style={{flex:"1 100%", overflow: "scroll"}}>
					<textarea
						style={{
							width:"100%",height:"100%",
							border:"1px solid lightgray",padding:5,
							fontSize:"9pt",
							lineHeight:"10pt",
							fontFamily: "calibri"
						}}
						disabled={!isMine}
						onChange={e=>this.setState({code:e.target.value})}
						defaultValue={code||start}
						/>
				</div>

				<div style={{flex:1}}>
					<TextField name="name" floatingLabelText="name" disabled={true}
						errorText={name && info.name!=name ? "name can't be changed" : null}
						fullWidth={true} value={name||info.name}/>
					<TextField name="description" floatingLabelText="description"  disabled={true}
						fullWidth={true} value={info.desc}/>
					<TextField name="version" floatingLabelText="version" disabled={true}
						fullWidth={true} value={info.ver}/>

					{info.conf && (<div>{JSON.stringify(info.conf)}</div>)}
				</div>

				<CommandBar style={{flex:1}}
					items={[
						"back",
						{
							action:"check",
							lable:"check",
							onSelect: ()=>this.check(code)
						},
						{
							action:"save",
							label:"save",
							onSelect: ()=>save(code, info)
						}
					]}
					/>
			</Fragment>
		)
	}

	check(){
		try{
			let info=install(this.state.code)
			this.setState({info})
		}catch(e){
			console.error(e)
		}
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
	mapProps(({plugin,update,upload})=>({
		save(code,info){
			return upload(code,plugin.id,`${info.ver}/index.js`)
				.then(({url})=>update({...info,code:url}))
		},
		plugin
	}))
)(Plugin)
