import React, {PureComponent, Component} from "react"
import {connect} from "react-redux"
import requirex from "./require-api"
import {Dialog} from "material-ui"

const isUrl=a=>/^http[s]?:\/\//i.test(a.trim())

const imported={}

export function install(plugin, uninstall=false){
	const {code,name,config}=plugin
	return (isUrl(code) ? fetch(code)
		.then(res=>{
			if(!res.ok){
				throw new Error(res.statusText)
			}
			return res.text()
		}) : Promise.resolve(code))
		.then(code=>{
			if(code.indexOf("__webpack_require__")!=-1){
				code=`return ${code}`
			}else if(true){
				code=`(function(){${code}})();`
			}
			
			code=`${code}\r\n//# sourceURL=plugins/${name}.js`
			
			const compiled=new Function("module,exports,require",code)
			const module={exports:{}}
			let  returned=compiled(module, module.exports, requirex)
			if(returned){//webpack module
				if(returned.default)
					return returned.default
				return returned
			}
			return module.exports
		})
		.then(exports=>{
			if(uninstall && imported[name]){
				imported[name].uninstall()
				delete imported[name]
			}
			exports.install(config)
			imported[name]=exports
			return exports
		})	
}

export default connect(state=>({
	plugins: state["we-office"].extensions
}))(
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
									this.loaded.push(a)
								})
								.catch(a=>{
									console.error(a)
								})
						})
				}, Promise.resolve())
				.then(()=>this.tried++)
				.then(()=>{
					if(this.tried<2 && this.loaded.length<this.props.plugins.length){
						return this.tryInstall(plugins)
					}
				})
				.finally(()=>this.setState({loading:null}))
		}

		render(){
			const {state:{loading}, tried}=this
			
			return (
				<Dialog 
					modal={true}
					open={!!loading}
					>
					{loading ? `${loading.name}...` : ""}
				</Dialog>
			)
		}
		
		componentWillReceiveProps({plugins}){
			this.tried=0
			this.props.plugins
				.forEach(a=>{
					if(imported[a.name] && -1==plugins.findIndex(b=>b.id==a.id)){
						imported[a.name].uninstall()
						delete imported[a.name]
						this.loaded.splice(this.loaded.findIndex(b=>b.id==a.id),1)
					}
				})
			this.tryInstall(plugins)
		}
	}
)
