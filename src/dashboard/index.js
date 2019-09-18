import React,{Fragment} from "react"
import PropTypes from "prop-types"
import {connect} from "react-redux"
import {compose, getContext,mapProps, setDisplayName} from  "recompose"

import Developer from "../developer"

export default compose(
	setDisplayName("WODashboard"),
	getContext({client:PropTypes.object}),
	connect(({qili:{user:{id}}, "we-edit":{active}})=>({user:id, hasDoc:!!active})),
	mapProps(({client,user, hasDoc, hasActiveWorkspace})=>{
		const {username, photo, isDeveloper}=client.get(user)
		return {
			username,
			photo,
			isDeveloper,
			hasDoc,
			hasActiveWorkspace
		}
	}),
)(({isDeveloper, username,hasDoc,hasActiveWorkspace})=>{
	if(hasDoc||hasActiveWorkspace){
		return null
	}
	if(isDeveloper){
		return <Developer style={{width:500,margin:"50px auto"}}/>
	}else{
		return <center>Hello {username}!</center>
	}
})
