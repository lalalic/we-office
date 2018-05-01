const React= require("react")
const project=require("./package.json")
const {QiliApp, File}=require("qili-app")

project.homepage=`http://localhost:${project.config.devPort}`

const spy=(Target, key, wired)=>{
	const _raw=Target[key]
	Target[key]=wired(_raw)
}

spy(File,"upload",_upload=>function(){
	return _upload(...arguments).catch(a=>a).then(a=>"images/icon.svg")
})

spy(QiliApp, "render", _render=>app=>_render(React.cloneElement(app, {
	service:project.config.service,
	isDev:false
})))
