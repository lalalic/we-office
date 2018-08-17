import React from "react"
import PropTypes from "prop-types"

import {FloatingActionButton} from "material-ui"
import IconTest from "material-ui/svg-icons/notification/adb"
import {File,ACTION}  from "qili-app"
import {install} from  "../plugin-loader"

import {compose, getContext,withProps, branch, renderNothing} from  "recompose"
import {connect} from "react-redux"


export const Creator=compose(
	getContext({client:PropTypes.object}),
	connect(({qili:{user:{id}}})=>({user:id})),
	withProps(({client,user,dispatch})=>{
		const {isDeveloper}=client.get(user)
		return {
			isDeveloper
		}
	}),
	branch(({isDeveloper})=>!isDeveloper, renderNothing),
)(({dispatch,isDeveloper,...props})=>(
	<FloatingActionButton
		{...props}
		className="floating sticky bottom right"
		onClick={()=>{
				File
					.selectTextFile(".js")
					.then(a=>install({code:a.data,name:"test"},true))
					.then(e=>dispatch(ACTION.MESSAGE("Your plugin installed!")))
					.catch(e=>dispatch(ACTION.MESSAGE({type:"error", message:e.message})))
			}
		}
		>
		<IconTest />
	</FloatingActionButton>
))

export const withCreator=(opt={})=>Base=>props=>(
	<Fragment>
		<Base {...props}/>
		<Creator {...(typeof(opt)=="function" ? opt(props) : opt||{})}/>
	</Fragment>
)