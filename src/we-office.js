import React,{Fragment} from "react"
import PropTypes from "prop-types"

import {graphql} from "react-relay"
import {compose, withProps,getContext} from "recompose"
import {connect} from "react-redux"
import {Router, Route, IndexRoute, Direct, IndexRedirect, hashHistory, Link} from "react-router"

import {withInit, withQuery, withPagination, withFragment, QiliApp, ACTION as qiliACTION,File,Account} from "qili-app"
import project from "../package.json"

import {reducer as weReducer, DOMAIN as weDOMAIN,  Loader} from "we-edit"
import {Office, TitleBar, Dashboard} from "we-edit/office"

import {MenuItem} from "material-ui"


import {DOMAIN,ACTION,reducer} from "./state"
import Portal from "./components/portal"
import PluginDebugger from "./components/plugin-debugger"
import Market,{Creator, Plugin} from "./market"
import My from "./setting/my"
import Avatar from "./dashboard"
import Profile from "./setting/profile"

import PluginLoader from "./plugin-loader"
import Developer from "./developer"

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
					isDeveloper
					extensions{
						...weOffice_extension @relay(mask: false)
					}
				}
			}
		`,
		_fragment:graphql`
			fragment weOffice_extension on Plugin{
				id
				name
				code
				config
				version
			}
		`,
		onSuccess(response,dispatch){
			let {me:{ token, id, extensions,isDeveloper}}=response
			dispatch(qiliACTION.CURRENT_USER({id,token}))

			dispatch((dispatch,getState)=>{
				const {"we-office":{extensions:lastPlugins}}=getState()
				if(isDeveloper){
					let testing=lastPlugins.find(a=>a.id=="test")
					if(testing){
						extensions=[...extensions,testing]
					}
				}
				dispatch(ACTION.EXTENSIONS(extensions))
			})
			//@TODO: to initialize your qili
		},
		onError(error,dispatch){
			dispatch(qiliACTION.LOGOUT)
		}
	}),
)(QiliApp)




export const routes=(
	<Router history={hashHistory}>
		<Route path="/" component={({officeChanged,children})=>{
						let officeWidget=null
						if(children && children.props.route.path=="load/:type"){
							officeWidget=children
							children=null
						}

						return (
							<Fragment>
								<Portal container={document.querySelector("#wo")}>

									<Office
										installable={true}
										dashboard={
											<Dashboard
												avatar={
													<Link to="/my" style={{textDecoration:"none",color:"inherit"}}>
														<Avatar/>
													</Link>}
												children={
													<MenuItem
														primaryText={
															<Link to="/market"
																style={{textDecoration:"none",color:"inherit",display:"block"}}>
																Market
															</Link>
														}
														/>
												}
												/>
										}
										titleBar={<TitleBar title="we-office"/>}
										>
										<PluginLoader>
											{officeWidget}
											<Portal container={document.querySelector("#app").parentNode}>
												<PluginDebugger mini={true} style={{position:"fixed",bottom:50,right:20}} />
											</Portal>
										</PluginLoader>
									</Office>

								</Portal>
								<Portal.Web container={document.querySelector("#app")}>
									{children}
								</Portal.Web>


							</Fragment>
						)
					}
				}
				>

			<Route path="developer">
				<IndexRoute component={Developer}/>
			</Route>

			<Route path="load/:type" component={({params:{type}, location:{query}})=>{
					return <Loader {...{...query,type,now:true}}/>
				}}>

			</Route>

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
								query  weOffice_plugins_Query($type:[PluginType],$mine: Boolean,
									$favorite: Boolean, $using:Boolean, $searchText:String,
									$count:Int=20, $cursor: JSON){
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
					)(Market)}/>

				<Route path="create" component={compose(
						getContext({router:PropTypes.object}),
						withProps(({router})=>({
							toPlugin: id=>router.replace(`/market/${id}`),
							goBack: ()=>router.goBack(),
						}))
					)(Creator)}/>

				<Route path=":id">
					<IndexRoute component={compose(
							withQuery(({params:{id}})=>({
								variables:{id},
								query:graphql`query weOffice_plugin_Query($id:ObjectID, $name:String){
									me{
										plugin(_id:$id, name:$name){
											...plugin_plugin
										}
									}
								}`,
							})),
							withProps(({data})=>({plugin:data.me.plugin})),
						)(Plugin)}/>
				</Route>

			</Route>

			{Account.routes({
				account:withQuery({
		            query:graphql`
		                query weOffice_account_Query{
		                    user:me{
		                        plugins{
		                            id
		                            name
		                        }
		                        extensions{
		                            id
		                            name
									version
		                        }
								isDeveloper
		                        ...qili_account_user
		                    }
		                }
		            `
		        })(My),
				profile:withQuery({
					query: graphql`
						query weOffice_profile_Query{
							user:me{
								...profile_user
							}
						}
					`
				})(Profile)
			})}
		</Route>
	</Router>
)
