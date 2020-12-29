import React,{Component} from "react"
import PropTypes from "prop-types"
import {connect} from "react-redux"
import {compose, getContext,mapProps, setDisplayName} from  "recompose"

import Developer from "../developer"
import requirex from "../plugin/require"

export default compose(
	setDisplayName("WODashboard"),
	getContext({client:PropTypes.object}),
	connect(({qili:{user:{id}}, "we-edit":{active}})=>({user:id, hasDoc:!!active})),
	mapProps(({client,user, hasDoc, hasActiveWorkspace})=>{
		const {id, username:name, photo, isDeveloper}=client.get(user)
		return {
			id,
			name,
			photo,
			isDeveloper,
			hasDoc,
			hasActiveWorkspace
		}
	}),
)(({isDeveloper, id, name, hasDoc,hasActiveWorkspace})=>{
	if(hasDoc||hasActiveWorkspace){
		return null
	}
	if(isDeveloper){
		return <Developer style={{width:500,margin:"50px auto"}}/>
	}else{
		return <PluginDashboard user={{id, name}}/>
	}
})

const PluginDashboard=connect(({"we-office":{pluginLoaded}})=>({pluginLoaded}))(
	class extends Component{
		render(){
			const {pluginLoaded, ...props}=this.props
			const Dashboard=requirex("dashboard")
			if(Dashboard){
				return <Dashboard {...props}/>
			}
			return <center>Hello {props.user.name}!</center>
		}
	}
)
