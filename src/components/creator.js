import React, {Fragment} from "react"
import {FloatingActionButton} from "material-ui"
import IconTest from "material-ui/svg-icons/notification/adb"
import {File,ACTION}  from "qili-app"
import {install} from  "../plugin-loader"

export const Creator=({dispatch,...props})=>(
	<FloatingActionButton
		{...props}
		className="floating sticky bottom right"
		onClick={()=>{
				File
					.selectTextFile(".js")
					.then(a=>install({code:a.data,name:"test"}))
					.then(e=>dispatch(ACTION.MESSAGE("Your plugin installed!")))
					.catch(e=>dispatch(ACTION.MESSAGE({type:"error", message:e.message})))
			}
		}
		>
		<IconTest />
	</FloatingActionButton>
)

export const withCreator=(opt={})=>Base=>props=>(
	<Fragment>
		<Base {...props}/>
		<Creator {...(typeof(opt)=="function" ? opt(props) : opt||{})}/>
	</Fragment>
)