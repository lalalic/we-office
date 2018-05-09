import React from "react"
import PropTypes from "prop-types"
import {connect} from "react-redux"
import {compose, getContext,mapProps, setDisplayName} from  "recompose"
import {Link} from "react-router"

export default compose(
	setDisplayName("Navigator"),
	getContext({client:PropTypes.object}),
	connect(({qili:{user:{id}}})=>({user:id})),
	mapProps(({client,user})=>{
		const {username, photo}=client.get(user)
		return {
			username,
			photo
		}
	}),
	
	
)(({username,photo})=>(
		<div className="nav">
			<Link to="/">Dashboard</Link>
			<Link to="/market">Market</Link>
			<Link to="/profile">Setting</Link>
			{username && <span>{username}</span>}
		</div>
	)
)