const React= require("react")
const project=require("./package.json")
const {QiliApp, File}=require("qili-app")

project.homepage=`http://localhost:${project.config.devPort}`

const spy=(Target, key, wired)=>{
	const _raw=Target[key]
	Target[key]=wired(_raw)
}

spy(File,"upload",_upload=>function(data){
	return Promise.resolve(data)
})

spy(QiliApp, "render", _render=>app=>_render(React.cloneElement(app, {
	service:project.config.service,
	isDev:true
})))
