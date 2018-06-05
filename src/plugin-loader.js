import React, {PureComponent, Component} from "react"
import {connect} from "react-redux"
import requirex from "./require-api"

const isUrl=a=>/^http[s]?:\/\//i.test(a.trim())

export function install(code){
	return (isUrl(code) ? fetch(code)
		.then(res=>{
			if(!res.ok){
				throw new Error(res.statusText)
			}
			return res.text()
		}) : Promise.resolve(code))
		.then(code=>{
			const compiled=new Function("module,exports,require",code)
			const module={exports:{}}
			compiled(module, module.exports, requirex)
		})
}

class PluginLoader extends PureComponent{
	state={loading:true}
	componentDidMount(){
		const {plugin:{code}, onload}=this.props
		install(code)
			.catch(e=>{
				this.setState({error:e.message})
				return e
			})
			.then(a=>{
				this.setState({loading:false})
				return a
			})
			.then(onload)
	}

	render(){
		const {state:{loading,error}, props:{plugin}}=this
		if(loading){
			return <div>loading plugin {plugin.name}...</div>
		}else if(error){
			return <div style={{color:"red"}}>{plugin.name}: {error} </div>
		}else
			return null
	}
}

export default connect(state=>({plugins: state["we-office"].extensions}))(
	class PluginLoaders extends PureComponent{
		state={loaded:0, errors:[]}
		render(){
			const {props:{plugins}, state:{loaded, errors}}=this
			if(plugins.length==0 || plugins.length==loaded)
				return null
			
			return (
				<div style={{position:"absolute",width:"100%",height:"100%"}}>
					<div style={{margin:"auto",width:400, height:300, background:"cadetblue"}}>
						{
							plugins.map(a=><PluginLoader
								plugin={a}
								key={`${a.id}-${a.version}`}
								onload={e=>this.setState(({loaded,errors})=>{
									loaded++
									if(e){
										errors=[...errors,a]
									}
									return {loaded,errors}
								})}
							/>)
						}
					</div>
				</div>
			)
		}
	}
)
