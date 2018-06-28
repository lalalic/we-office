import React from "react"
import PropTypes from "prop-types"
import {connect} from "react-redux"
import {compose, getContext,mapProps, setDisplayName} from  "recompose"
import {Link} from "react-router"
import {Creator} from "./creator"

export default compose(
	setDisplayName("Navigator"),
	getContext({client:PropTypes.object}),
	connect(({qili:{user:{id}}})=>({user:id})),
	mapProps(({client,user,dispatch})=>{
		const {username, photo,isDeveloper}=client.get(user)
		return {
			username,
			photo,
			isDeveloper,
			dispatch
		}
	}),


)(({username,photo,isDeveloper,dispatch})=>(
		<div className="nav">
			<Link activeClassName="primary" to="/">Home</Link>
			<Link activeClassName="primary" to="/market">Market</Link>
			<Link activeClassName="primary" to="/my">{username||"Setting"}</Link>
			{isDeveloper && <Creator mini={true} dispatch={dispatch}/>}
		</div>
	)
)
