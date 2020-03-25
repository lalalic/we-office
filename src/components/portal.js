import React, {Component, PureComponent, Fragment} from "react"
import {createPortal} from "react-dom"
import {Link} from "react-router"
import {AppBar, Paper, IconButton} from "material-ui"
import NavigationClose from 'material-ui/svg-icons/navigation/close'

export const Portal=({children,container})=>createPortal(children, container)

export class Web extends PureComponent{
	render(){
		const {container, children, ...props}=this.props
		if(children){
			container.classList.remove("inactive")
			const {location:{pathname}}=children.props
			const title=pathname.split("/")[1]
			container.style.zIndex=2
			return createPortal(
				<Fragment>
					<AppBar
						style={{height:36}}
						zDepth={2}
						showMenuIconButton={false}
						title={title}
						titleStyle={{fontSize:"small", lineHeight:"100%", height:"auto", marginTop:"auto", marginBottom:"auto"}}
						{...props}
						iconElementRight={
							<Link to="/">
								<IconButton style={{height:24,width:24,padding:0}}>
									<NavigationClose style={{height:24,width:24}}/>
								</IconButton>
							</Link>
						}
						/>
					<Paper zDepth={2} style={{flex:"1 100%",display:"flex", flexDirection:"column",overflow:'scroll'}}>
					{children}
					</Paper>
				</Fragment>,
				container
			)
		}else{
			container.classList.add("inactive")
		}
		return null
	}
}

export default Portal

Portal.Web=Web
