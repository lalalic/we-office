import React, {PureComponent, Component} from "react"
import {connect} from "react-redux"
import requirex from "./require-api"

const isUrl=a=>/^http[s]?:\/\//i.test(a.trim())

export function install({code,name,config}){
	return (isUrl(code) ? fetch(code)
		.then(res=>{
			if(!res.ok){
				throw new Error(res.statusText)
			}
			return res.text()
		}) : Promise.resolve(code))
		.then(code=>{
			code=`${code}\r\n//# sourceURL=plugins/${name}.js`
			const compiled=new Function("module,exports,require",code)
			const module={exports:{}}
			compiled(module, module.exports, requirex)
			return module.exports
		})
		.then(exports=>exports.install(config))
}

export default connect(state=>({plugins: state["we-office"].extensions}))(
	class PluginLoaders extends PureComponent{
		constructor(){
			super(...arguments)
			this.state={loading:null}			
			this.loaded=[]
			this.tried=0
		}
		
		componentDidMount(){
			this.tryInstall(this.props.plugins)
		}
		
		tryInstall(plugins){
			plugins
				.filter(a=>!this.loaded.find(b=>b.id==a.id))
				.reduce((p, a)=>{
					return p
						.finally(()=>{
							this.setState({loading:a})
							return install(a)
								.then(()=>{
									console.debug(`loaded ${a.name}`)
									this.loaded.push(a)
								})
								.catch(a=>void(0))
								.finally(()=>this.setState({loading:null}))
						})
				}, Promise.resolve())
				.then(()=>this.tried++)
				.then(()=>{
					if(this.tried<2 && this.loaded.length<this.props.plugins.length){
						this.tryInstall(plugins)
					}
				})
		}

		render(){
			const {state:{loading}, tried}=this
			
			if(!loading)
				return null
			
			return (
				<div style={{position:"absolute",width:"100%",height:"100%"}}>
					<div style={{margin:"auto",width:400, height:300, background:"cadetblue"}}>
						loading {loading.name}...
					</div>
				</div>
			)
		}
		
		componentWillReceiveProps({plugins}){
			this.tried=0
			this.tryInstall(plugins)
		}
	}
)
