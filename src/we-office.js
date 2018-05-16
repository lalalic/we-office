import React from "react"
import PropTypes from "prop-types"

import {graphql} from "react-relay"
import {compose, withProps,getContext} from "recompose"
import {connect} from "react-redux"
import {Router, Route, IndexRoute, Direct, IndexRedirect, hashHistory} from "react-router"

import {withInit, withQuery, withPagination, QiliApp, ACTION as qiliACTION, Setting, Profile,File} from "qili-app"
import project from "../package.json"

import {reducer as weReducer, DOMAIN as weDOMAIN} from "we-edit"
import {DefaultOffice, Ribbon} from "we-edit/office"



import {DOMAIN,ACTION,reducer} from "./state"
import Navigator from "./components/navigator"
import {withCreator} from "./components/creator"
import Dashboard from "./dashboard"
import Market,{Creator as CreatePlugin, Plugin} from "./market"
import PluginLoader from "./plugin-loader"

export const WeOffice = compose(
	withProps(()=>({
		project,
		title:"we-office",
		appId:project.config.appId,//get from app.qili2.com
		reducers:{[DOMAIN]:reducer,[weDOMAIN]:weReducer},
		persistStoreConfig:{blacklist:[weDOMAIN]},
		//supportOffline:,
		//tutorials:["",""],
		adUrl:"images/splash.svg",
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
						code
						conf
					}
				}
			}
		`,
		onSuccess(response,dispatch){
			const {me:{ token, id, extensions}}=response
			//dispatch(qiliACTION.CURRENT_USER({id,token}))
			dispatch(ACTION.EXTENSIONS(extensions))
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
					<div id="portal">
						<PluginLoader/>
						{children}
					</div>
				</DefaultOffice>
			}>
			<IndexRoute component={Dashboard}/>
			<Route path="home" component={Dashboard}/>
			<Route path="market"> 
				<IndexRoute component={compose(
						getContext({router:PropTypes.object}),
						connect(state=>({qs:state["we-office"].qs}),dispatch=>({
							search(qs){
								dispatch(ACTION.QUERY(qs))
							}
						})),
						withPagination(({qs})=>({
							variables:qs,
							query:graphql`
								query  weOffice_plugins_Query($type:[PluginType],$mine: Boolean, $favorite: Boolean, $using:Boolean, $searchText:String, $count:Int=20, $cursor: JSON){
									...list_plugins
								}
							`,
						})),
						withProps(({data,router})=>({
							plugins:data,
							toPlugin(id){
								router.push(`/market/${id}`)
							}
						})),
						withCreator(({router})=>({
							mini:true,
							onClick(){
								router.push(`/market/create`)
							}
						})),
					)(Market)}/>
					
				<Route path="create" component={compose(
						getContext({router:PropTypes.object}),
						withProps(({router})=>({
							toPlugin: id=>router.replace(`/market/${id}`),
							goBack: ()=>router.goBack(),
						}))
					)(CreatePlugin)}/>
				
				<Route path=":id" component={compose(
						withQuery(({params:{id}})=>({
							variables:{id},
							query:graphql`query weOffice_plugin_Query($id:ObjectID){
								me{
									plugin(_id:$id){
										...plugin_plugin
									}
								}
							}`,
						})),
						withProps(({data})=>({plugin:data.me.plugin})),
					)(Plugin)}/>
					
			</Route>
			
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
