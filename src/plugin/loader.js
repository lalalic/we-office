import React, {PureComponent, Component,Fragment} from "react"
import {connect} from "react-redux"
import requirex from "./require"
import {Dialog} from "material-ui"
import immutable from "immutable"

const isLocalTest=a=>a.startsWith("data:application/javascript;base64,")

const isUrl=a=>/^http[s]?:\/\//i.test(a.trim())||isLocalTest(a)

const imported=requirex.imported={}

function install(plugin){
	const {code,name,config,version}=plugin
	return (isUrl(code) ? fetch(code)
		.then(res=>{
			if(!res.ok){
				throw new Error(res.statusText)
			}
			return res.text()
		}) : Promise.resolve(code))
		.then(raw=>{
			const sourceFileName=`plugins/${name}/${version}.js`
			if(raw.indexOf("__webpack_require__")==-1){
				return import(/* webpackChunkName: "plugin-compiler" */"./transform")
					.then(({transform})=>{
						const {code,map}=transform(raw)
						return `${code}\r\n//# sourceMappingURL=${map}`
					})
			}else{
				return `return ${raw}\r\n//# sourceURL=${sourceFileName}`
			}
		})
		.then(code=>{
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
			if(imported[name]){
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
			this.state={loading:false}
			this.tried=0
			this.unmounted=false
		}

		componentDidMount(){
			this.tryInstall(this.props.plugins)
		}

		tryInstall(plugins){
			plugins
				.filter(a=>!imported[a.name])
				.reduce((p, a)=>{
					return p
						.finally(()=>{
							if(!this.unmounted){
								this.setState({loading:a})
								return install(a)
									.catch(e=>{
										console.error({plugin:a, error:e})
									})
							}
						})
				}, Promise.resolve())
				.then(()=>this.tried++)
				.then(()=>{
					if(!this.unmounted && this.tried<2 && this.props.plugins.find(a=>!imported[a.name])!=-1){
						return this.tryInstall(plugins)
					}
				})
				.finally(()=>{
					if(!this.unmounted){
						this.setState({loading:null})
					}
				})
		}

		render(){
			const {state:{loading}, props:{children}}=this
			if(loading==null){
				return (
					<Fragment>
						{children}
					</Fragment>
				)
			}


			return (
				<Dialog
					modal={true}
					open={!!loading}
					>
					{loading ? `${loading.name}...` : ""}
				</Dialog>
			)
		}

		componentDidUpdate(prev){
			const {loading}=this.state
			if(loading===null){
				const {plugins}=this.props
				if(plugins!=prev.plugins
					&& !immutable.List(plugins).equals(immutable.List(prev.plugins))){
					prev.plugins
						.forEach(a=>{
							let plugin=imported[a.name]
							if(plugin && -1==plugins.findIndex(b=>b.id==a.id && b.version==a.version)){
								if(plugin.uninstall){
									plugin.uninstall()
								}
								delete imported[a.name]
							}
						})

					this.tried=0
					this.tryInstall(plugins)
				}

				const {onLoaded=a=>a}=this.props
				onLoaded()
			}
		}

		componentWillUnmount(){
			this.unmounted=true
		}
	}
)
