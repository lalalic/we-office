import React,{Fragment} from "react"
import PropTypes from "prop-types"
import {connect} from "react-redux"
import {Link} from "react-router"
import {compose, getContext,mapProps, setDisplayName} from  "recompose"

import {Avatar} from "material-ui"

export default compose(
	setDisplayName("CurrentUser"),
	getContext({client:PropTypes.object}),
	connect(({qili:{user:{id}}})=>({user:id})),
	mapProps(({client,user,dispatch, link})=>{
		const {username, photo}=client.get(user)
		return {
			username,
			photo,
			dispatch,
			link
		}
	}),
)(({username, photo, dispatch,link})=>{
	let avatar=null
	if(photo){
		avatar=<Avatar src={photo}/>
	}else{
		avatar=<Avatar children={username||"Z"}/>
	}
	return (
			<Link to={link}>
				{avatar}
			</Link>
	)
})

