import React,{Fragment} from "react"
import PropTypes from "prop-types"
import {connect} from "react-redux"
import {compose, getContext,mapProps, setDisplayName} from  "recompose"

import Developer from "../developer"

export default compose(
	setDisplayName("WODashboard"),
	getContext({client:PropTypes.object}),
	connect(({qili:{user:{id}}})=>({user:id})),
	mapProps(({client,user})=>{
		const {username, photo, isDeveloper}=client.get(user)
		return {
			username,
			photo,
			isDeveloper
		}
	}),
)(({isDeveloper, username})=>{
	if(isDeveloper){
		return <Developer style={{width:500,margin:"50px auto"}}/>
	}else{
		return <div>Hello, ${username}!</div>
	}
})
