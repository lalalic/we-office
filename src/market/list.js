import React, {Fragment,Component} from "react"

import PullToRefresh from "qili-app/components/pull-to-refresh"
import {compose, mapProps} from "recompose"
import {withFragment} from "qili-app/graphql"
import {TextField, List, ListItem} from "material-ui"
import IconUsing from "material-ui/svg-icons/navigation/check"


import QuickSearch,{toText} from "./quick-search"

class Plugins extends Component{
	state={searchText:"",conditionAnchor:undefined}
	render(){
		const {plugins, refresh, loadMore, qs, search,toPlugin}=this.props
		const {searchText,conditionAnchor}=this.state
		return (
			<Fragment>
				<TextField
						hintText={`${toText(qs)}`||"search"}
						name="search"
						value={searchText||""}
						onChange={(e,searchText)=>this.setState({searchText})}
						onKeyDown={e=>e.keyCode==13 && search({searchText})}
						onFocus={e=>this.setState({conditionAnchor:e.target})}
						fullWidth={true}/>

				<QuickSearch
					qs={qs}
					style={{opacity:0.9}}
					open={!!conditionAnchor}
					anchorEl={conditionAnchor}
					anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
					targetOrigin={{horizontal: 'left', vertical: 'top'}}
					search={condition=>{
						this.setState({conditionAnchor:undefined})
						search(condition)
					}}
					/>
				<div style={{overflow:"scroll"}}>
					<PullToRefresh onRefresh={refresh} onMore={loadMore}>
						<List>
						{plugins.map(({id,name,description,version, using, isMine, author:{username}})=>(
								<ListItem key={id}
									leftIcon={using ? <IconUsing/> : <span/>}
									primaryText={name}
									secondaryTextLines={2}
									secondaryText={`[${version}] ${description} ${username ? `by ${username}` : ""}`}
									onClick={()=>toPlugin(id)}
									/>
							))}
						</List>
					</PullToRefresh>
				</div>
			</Fragment>
		)
	}
}

export default compose(
	withFragment({
		plugins:graphql`fragment list_plugins on Query{
			plugins(type:$type, mine:$mine, favorite:$favorite, using:$using,
				searchText:$searchText, first:$count, after:$cursor)@connection(key:"list_plugins"){
				edges{
					node{
						id
						name
						description
						version
						author{
							username
						}
						isMine
						using
					}
				}
				pageInfo{
					hasNextPage
					endCursor
				}
			}
		}`
	}),
	mapProps(({plugins:{plugins:{edges}}, relay,search,qs, toPlugin})=>(
		{
			plugins:edges.map(a=>a.node),
			refresh(ok){
				ok()
			},
			loadMore(ok){
				if(relay.hasMore() && !relay.isLoading()){
					relay.loadMore(10, e=>{
						ok()
						if(e){
							console.error(e)
						}
					})
				}else
					ok()
			},
			search,qs,toPlugin
		}
	))
)(Plugins)
