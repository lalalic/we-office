import React,{Fragment} from "react"
import PropTypes from "prop-types"
import {connect} from "react-redux"
import {compose, getContext,mapProps, setDisplayName} from  "recompose"

import {Avatar} from "material-ui"

export default compose(
	setDisplayName("CurrentUser"),
	getContext({client:PropTypes.object}),
	connect(({qili:{user:{id}}})=>({user:id})),
	mapProps(({client,user})=>{
		const {username, photo}=client.get(user)
		return {
			username,
			photo
		}
	}),
)(({username, photo})=>{
	if(photo){
		return <Avatar src={photo}/>
	}else{
		return <Avatar children={username||"Z"}/>
	}
})
