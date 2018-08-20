import React, {Component, PureComponent, Fragment} from "react"
import {createPortal} from "react-dom"
import {Link} from "react-router"
import {AppBar, Paper, IconButton} from "material-ui"
import NavigationClose from 'material-ui/svg-icons/navigation/close'

export const Portal=({children,container})=>createPortal(children, container)

export class Web extends PureComponent{
	render(){
		const {container, children, ...props}=this.props
		container.style.zIndex=""
		container.style.background="transparent"
		if(children){
			container.style.zIndex=2
			return createPortal(
				<Fragment>
					<AppBar
						style={{height:36}}
						zDepth={2}
						showMenuIconButton={false}
						{...props}
						iconElementRight={
							<Link to="/">
								<IconButton style={{height:24,width:24,padding:0}}>
									<NavigationClose style={{height:24,width:24}}/>
								</IconButton>
							</Link>
						}
						/>
					<Paper zDepth={2} style={{flex:"1 100%",display:"flex", flexDirection:"column"}}>
					{children}
					</Paper>
				</Fragment>,
				container
			)
		}
		return null
	}
}

export default Portal

Portal.Web=Web