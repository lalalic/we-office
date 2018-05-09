import React from "react"
import PropTypes from "prop-types"
import {compose, getContext, withProps, withStateHandlers} from "recompose"

import {Popover, Chip, Subheader} from "material-ui"
import {blue300 as SELECTED, indigo900} from 'material-ui/styles/colors'

const CAPS=["Input","Loader","Emitter","Output","Ribbon", "Representation"]
const CONDS=[
	{label:"自己写的",key:"mine"},
	{label:"收藏的",key:"favorite"},
]
const style={
	 chip: {
		margin: 4,
	  },
	  wrapper: {
		display: 'flex',
		flexWrap: 'wrap',
		margin: 10
	  }
}
export const QuickSearch=({
	mine,favorite,ph={mine,favorite},
	categories=[],
	toggle, toggleCategory, search,
	...others})=>(
	<Popover {...others} onRequestClose={()=>{
			search({mine,favorite,tasking,tasked,categories,tags})
		}}>
		<div>
			<Subheader>Common Used</Subheader>
			<div style={style.wrapper}>
				{
					CONDS.map(({label,key})=>(
						<Chip key={label}
							style={style.chip}
							backgroundColor={ph[key] ? SELECTED: undefined}
							onClick={()=>toggle(key)}>{label}</Chip>
					))
				}
			</div>
		</div>
		<div>
			<Subheader>Plugin Type</Subheader>
			<div style={style.wrapper}>
				{CAPS.map(a=>(
					<Chip key={a}
						backgroundColor={categories.includes(a)? SELECTED : undefined}
						style={style.chip}
						onClick={()=>toggleCategory(a)}>
						{a}
					</Chip>
				))}
			</div>
		</div>
	</Popover>
)

export const toText=({categories,...qs})=>{
	let conds=[...categories]
	CONDS.forEach(({key,label})=>qs[key] && conds.push(label))
	return conds.join(",")
}

export default compose(
	withStateHandlers(
		({qs})=>({...qs}),
		{
			toggle:(state,{})=>key=>{
				let prev=!!state[key]
				return {[key]:!prev}
			},
			toggleCategory: ({categories})=>a=>{
				let i=categories.indexOf(a)
				if(i==-1){
					return {categories:[...categories,a]}
				}else{
					let changing=[...categories]
					changing.splice(i,1)
					return {categories:changing}
				}
			},
		}
	),
)(QuickSearch)
