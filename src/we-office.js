import React from "react"
import {graphql} from "react-relay"
import {compose, withProps} from "recompose"
import {connect} from "react-redux"
import {Router, Route, IndexRoute, Direct, IndexRedirect, hashHistory} from "react-router"

import {withInit, withQuery, QiliApp, ACTION as qiliACTION, Setting, Profile} from "qili-app"
import project from "../package.json"

import {reducer as weReducer, DOMAIN as weDOMAIN} from "we-edit"
import {DefaultOffice, Ribbon} from "we-edit/office"



import {DOMAIN,ACTION,reducer} from "./state"
import Navigator from "./components/navigator"
import Dashboard from "./dashboard"
import Market from "./market"

export const WeOffice = compose(
	withProps(()=>({
		project,
		title:"we-office",
		appId:project.config.appId,//get from app.qili2.com
		reducers:{[DOMAIN]:reducer,[weDOMAIN]:weReducer},
		persistStoreConfig:{blacklist:[weDOMAIN]}
		//supportOffline:
		//tutorials:["",""]
		//adUrl:""
	})),
	withInit({
		query:graphql`
			query weOffice_prefetch_Query{
				me{
					id
					token
					username
					photo
					extensions{
						id
						conf
					}
				}
			}
		`,
		onSuccess(response,dispatch){
			const {me:{ token, id, extensions}}=response
			//dispatch(qiliACTION.CURRENT_USER({id,token}))
			//dispatch(ACTION.EXTENSIONS(extensions))
			//@TODO: to initialize your qili
		},
		onError(error,dispatch){
			dispatch(qiliACTION.LOGOUT)
		}
	}),
)(QiliApp)


export const routes=(
	<Router history={hashHistory}>
		<Route path="/" component={({children})=>
				<DefaultOffice titleBarProps={{
						title:"we-office",
						children:<Navigator/>
					}}>
					<div id="portal">{children}</div>
				</DefaultOffice>
			}>
			<IndexRoute component={Dashboard}/>
			<Route path="market" component={compose(
					withQuery({
						query:graphql`
							query  weOffice_plugins_Query($type:[PluginType],$mine: Boolean, $favorite: Boolean, $search:String, $count:Int=20, $cursor: JSON){
								...list_plugins
							}
						`,
					})
				)(Market)}/>
			
			<Route path="setting" component={Setting}/>
			
			<Route path="profile" component={compose(
					withQuery({
						query:graphql`
							query weOffice_profile_Query{
								me{
									id
									username
									birthday
									gender
									location
									photo
									signature
								}
							}
							`,
					}),
					withProps(({me})=>({
						...me,
						birthday: me&&me.birthday ? new Date(me.birthday) : undefined
					})),
					)(Profile)}/>
		</Route>
	</Router>
)
