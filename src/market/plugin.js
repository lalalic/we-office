import React, {Component} from "react"
import {withFragment} from "qili-app"
import {TextField} from "material-ui"
import {BottomNavigation, BottomNavigationItem} from 'material-ui/BottomNavigation';

export class Plugin extends Component{
	state={code:"",selectedIndex:0}
	render(){
		const {state:{code},info}=this
		return (
			<Fragment>
				<div>
					<textarea style={{width:"100%"}} onchange={({value})=>this.setState({code:value})}>
						{code}
					</textarea>
				</div>
				
				{info && (
					<div>
						<TextField name="name" value={info.name}/>
						<TextField name="description" value={info.description}/>
						<TextField name="version" value={info.version}/>
						<TextField name="free" value={info.free}/>
						{info.conf && (<div>{JSON.stringify(info.conf)}</div>)}
					</div>
				)}
				
				<BottomNavigator selectedIndex={this.state.selectedIndex}>
					<BottomNavigationItem
						label="Check"
						/>
						
					<BottomNavigationItem
						label="Save"
						/>
				</BottomNavigator>
			</Fragment>
		)
	}
	
	exports(){
		try{
			const module={exports:{}}
			new Function("module,exports,require",this.state.code)();
			this.info=module.exports
		}catch(e){
			
		}
	}
}

export default compose(
	withFragment(graphql`fragment plugin_data on Plugin{
		id
		name
		description
		version
		free
		conf
	}`),
	withMutation(({id},code)=>({
		name:"update",
		patch4:id,
		variables:{id,code},
		mutation:graphql`mutation plugin_update_Mutation($id:ObjectID!,$code:String!){
				plugin_update(_id:$id,code:$code){
					...plugin_data
				}
			}`
	})),
)(Plugin)