import React,{Fragment, Component} from "react"
import PropTypes from "prop-types"

import {graphql} from "react-relay"
import {compose, withProps,getContext, setDisplayName} from "recompose"
import {connect} from "react-redux"
import {Router, Route, IndexRoute, browserHistory, Link} from "react-router"

import {QiliApp, ACTION as qiliACTION} from "qili-app"
import Account from "qili-app/components/account"
import {withInit, withQuery, withPagination} from "qili-app/graphql"
import project from "../package.json"

import {reducer as weReducer, DOMAIN as weDOMAIN,  Loader} from "we-edit"
import {Office, TitleBar, Dashboard} from "we-edit/office"
import {FontManager} from "we-edit/representation-pagination"

import {MenuItem} from "material-ui"


import {DOMAIN,ACTION,reducer} from "./state"
import Portal from "./components/portal"
import PluginDebugger from "./plugin/debugger"
import Avatar from "./components/avatar"
import Market,{Creator, Plugin} from "./market"
import My from "./setting/my"
import Profile from "./setting/profile"
import WODashboard from "./dashboard"
import Home from "./dashboard/home"

import PluginLoader from "./plugin/loader"
import Developer from "./developer"

FontManager.asService()

export const WeOffice = compose(
	setDisplayName("we-office"),
	withProps(props=>({
		project,
		title:"we-office",
		service:"https://api.wenshubu.com/1/graphql",
		appId:project.config.appId,//get from app.qili2.com
		reducers:{[DOMAIN]:reducer,[weDOMAIN]:weReducer},
		persistStoreConfig:{blacklist:[weDOMAIN]},
		//supportOffline:,
		//tutorials:["",""],
		adUrl:"images/splash.svg",
		...props
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

class OfficeEx extends Component{
	constructor(){
		super(...arguments)
		this.state={}
	}

	render(){
		const {error}=this.state
		const {recovery, ...props}=this.props
		if(error){
			return (
				<Office {...props} workspaces={[]}>
					{recovery || <pre>{error.stack}</pre>}
				</Office>
			)
		}

		return <Office {...props}/>
	}

	componentDidCatch(error){
		this.setState({error})
	}

	static getDerivedStateFromError(error){
		return {error}
	}
}

const _=id=>id.split(":").pop()

export const routes=(
	<Router history={browserHistory}>
		<Route path="/" component={({children})=>{
						let officeWidget=null
						if(children && children.props.route.path=="load/:type"){
							officeWidget=children
							children=null
						}

						return (
							<Fragment>
								<Portal container={document.querySelector("#wo")}>
									<OfficeEx
										dashboard={
											<Dashboard
												avatar={
													<Link to="/my" style={{textDecoration:"none",color:"inherit"}}>
														<Avatar/>
													</Link>
												}
												menus={
													<MenuItem
														primaryText={
															<Link to="/market"
																style={{textDecoration:"none",color:"inherit",display:"block"}}>
																Market
															</Link>
														}
														/>
												}
												>
													<Home/>
												</Dashboard>
										}
										titleBar={<TitleBar title="we-office"/>}
										>
										<WODashboard/>
										<PluginLoader>
											{officeWidget}
											<Portal container={document.querySelector("#app").parentNode}>
												<PluginDebugger mini={true} style={{position:"fixed",bottom:50,right:20}} />
											</Portal>
										</PluginLoader>
									</OfficeEx>
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
								router.push(`/market/${_(id)}`)
							}
						})),
					)(Market)}/>

				<Route path="create" component={compose(
						getContext({router:PropTypes.object}),
						withProps(({router})=>({
							toPlugin: id=>router.replace(`/market/${_(id)}`),
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
				account:compose(
					withQuery({
						query:graphql`
							query weOffice_account_Query{
								user:me{
									...my_user
								}
							}
						`
					}),
					withProps(({data:{user}})=>({
						user,
						toPlugin: id=>`/market/${_(id)}`
					})),
				)(My),
				profile:compose(
					withQuery({
						query: graphql`
							query weOffice_profile_Query{
								user:me{
									...profile_user
								}
							}
						`
					}),
					withProps(({data:{user}})=>({user})),
				)(Profile)
			})}
		</Route>
	</Router>
)


const Fragment_weOffice_extension=graphql`
	fragment weOffice_extension on Plugin{
		id
		name
		code
		config
		version
	}
`