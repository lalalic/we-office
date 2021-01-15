import React from "react"
import project from "./package.json"
import {QiliApp} from "qili-app"

project.homepage="http://localhost:9083"

const _render=QiliApp.render
QiliApp.render=function(app){
	_render(React.cloneElement(app, {
		service:project.config.service,
		ws: project.config.ws,
		isDev:false
	}))
}
