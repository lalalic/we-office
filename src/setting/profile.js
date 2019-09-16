import React from "react"
import {compose} from "recompose"
import {Toggle} from "material-ui"

import {withFragment, withMutation} from "qili-app/graphql"
import Profile from "qili-app/components/profile"

export default compose(
	withFragment({user:graphql`
		fragment profile_user on User{
			...qili_profile_user
			isDeveloper
		}
	`}),
	withMutation({
		name:"setDeveloper",
		mutation:graphql`
			mutation profile_setDeveloper_Mutation($be:Boolean!){
				user_setDeveloper(be:$be){
					isDeveloper
				}
			}
		`
	})
)(({setDeveloper,...props})=>(
	<Profile {...props}>
		<Toggle
			label="Want to be developer"
			toggled={props.user.isDeveloper}
			onToggle={(e,be)=>setDeveloper({be})}
			/>
	</Profile>
))