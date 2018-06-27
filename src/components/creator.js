import React, {Fragment} from "react"
import {FloatingActionButton} from "material-ui"
import IconAdd from "material-ui/svg-icons/content/add"
import {File}  from "qili-app"
import {install} from  "../plugin-loader"

export const Creator=props=>(
	<FloatingActionButton
		{...props}
		className="floating sticky bottom right">
		<IconAdd onClick={()=>{
					File
						.selectTextFile()
						.then(a=>install({code:a.data,name:"test"}))
				}
			}/>
	</FloatingActionButton>
)

export const withCreator=(opt={})=>Base=>props=>(
	<Fragment>
		<Base {...props}/>
		<Creator {...(typeof(opt)=="function" ? opt(props) : opt||{})}/>
	</Fragment>
)