import React, {Fragment} from "react"
import {FloatingActionButton} from "material-ui"
import IconAdd from "material-ui/svg-icons/content/add"

const Creator=props=>(
	<FloatingActionButton
		{...props}
		className="floating sticky bottom right">
		<IconAdd/>
	</FloatingActionButton>
)

export const withCreator=(opt={})=>Base=>props=>(
	<Fragment>
		<Base {...props}/>
		<Creator {...(typeof(opt)=="function" ? opt(props) : opt||{})}/>
	</Fragment>
)