import React from "react"
import {Route, IndexRoute} from "react-router"
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { compose, withProps, mapProps } from "recompose";
import {withQuery,withPagination,withFragment} from "qili-app/graphql"

import {Plugins} from "../market/list"
import Plugin from "./plugin"

import Dashboard from "./dashboard"
import Introduction from "./introduction"
import Dev from "./docs/dev"


export const App=({children, req, ...theme})=>{
    if(req && req.headers){
        theme.userAgent=req.headers['user-agent']||"all"
    }
    return (
        <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
            {children}
        </MuiThemeProvider> 
    )
}

const _=id=>id.split(":").pop()

export default (
    <Route path="/" component={Dashboard}>
        <IndexRoute component={Introduction}/>
        <Route path="docs" clientOnly={true} component={({children})=>children}>
            <Route path="dev" component={Dev}/>
        </Route>

        <Route path="market">
            <IndexRoute component={compose(
                withPagination(({location:{query:{q}}})=>{
                    return {
                        variables:JSON.parse(q||"{}")||{},
                        query:graphql`
                            query routes_plugins_Query($type:[PluginType],$searchText:String,
                                        $count:Int=20, $cursor: JSON){
                                anonymous{
                                    ...routes_plugins
                                }
                            }
                        `
                    }
                }),
                withProps(({data})=>({
                    plugins:data.anonymous
                })),
                withFragment({
                    plugins:graphql`fragment routes_plugins on Anonymous{
                        plugins(type:$type, searchText:$searchText, first:$count, after:$cursor)@connection(key:"routes_plugins"){
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
                mapProps(({plugins:{plugins:{edges}},location:{query:{q}}, router, relay,routes:[{path:root}]})=>(
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
                        search(qs){
                            router.push(`${root}market?q=${JSON.stringify(qs||{})}`)
                        },
                        qs:q||{},
                        toPlugin(id){
                            router.push(`${root}market/${_(id)}`)
                        },
                        anonymous:true,
                    }
                ))
            )(props=><div style={{margin:10}}><Plugins {...props}/></div>)}/>

            <Route path=":id" component={compose(
                withQuery(({params:{id}})=>({
                    variables:{id},
                    query:graphql`query routes_plugin_Query($id:ObjectID){
                        anonymous{
                            plugin(_id:$id){
                                ...plugin_plugin_anonymous
                            }
                        }
                    }`,
                })),
                withProps(({data})=>({plugin:data.anonymous.plugin})),
            )(Plugin)}/>
        </Route>
    </Route>
)