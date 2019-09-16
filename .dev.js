import React from "react"
import project from "./package.json"
import {QiliApp} from "qili-app"
import File from "qili-app/components/file"

const _upload=File.upload
File.upload=function(){
	return _upload(...arguments).catch(a=>a).then(a=>"images/icon.svg")
}

project.homepage="http://localhost:9083"

const _render=QiliApp.render
QiliApp.render=function(app){
	_render(React.cloneElement(app, {
		service:project.config.service,
		isDev:false
	}))
}
