import React from "react"
import PropTypes from "prop-types"

import {compose, getContext,withProps, branch, renderNothing, setDisplayName} from  "recompose"
import {connect} from "react-redux"
import {red500,lightGreen500} from 'material-ui/styles/colors'

import {FloatingActionButton} from "material-ui"
import IconTest from "material-ui/svg-icons/notification/adb"
import {File}  from "qili-app"
import {ACTION} from "../state"

import requirex from "../require-api"


export default compose(
	setDisplayName("PluginDebugger"),
	getContext({client:PropTypes.object}),
	connect(({qili:{user:{id}},"we-office":{extensions}})=>({
		user:id,
		extensions,
	})),
	withProps(({client,user,dispatch})=>{
		const {isDeveloper}=client.get(user)
		return {
			isDeveloper
		}
	}),
	branch(({isDeveloper})=>!isDeveloper, renderNothing),
)(({dispatch,isDeveloper,extensions=[], testing=extensions.find(a=>a.id=="test"),...props})=>(
	<FloatingActionButton
		{...props}
		className="floating sticky bottom right"
		onClick={e=>{
				if(e.target.type=="checkbox" && testing){
					dispatch(ACTION.EXTENSIONS(extensions.filter(a=>a.id!="test")))
					return
				}

				File
					.selectTextFile(".js")
					.then(a=>new Promise((resolve, reject)=>{
							let reader=new FileReader()
							reader.onload=e=>resolve(e.target.result)
							reader.readAsDataURL(new Blob([a.data],{type:"application/javascript"}))
					}))
					.then(url=>{
						dispatch(ACTION.EXTENSIONS([
							...extensions.filter(a=>a.id!="test"),
							{name:"test",id:"test",version:Date.now()+"",code:url}
						]))
					})
			}
		}
		>
		<IconTest
			style={{fill: !testing ? "white" : (requirex.imported.test ? lightGreen500 : red500) }}/>
			{testing && (
				<span style={{position:"absolute",width:0,height:0,top:0,left:0}}>
					<input type="checkbox" defaultChecked={!!testing} style={{margin:0}}/>
				</span>
			)}

	</FloatingActionButton>
))
