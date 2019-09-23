const React=require("react")
const {Readable}=require("readable-stream")
const {ACTION,Viewer, Editor,Representation,Input:{EditableDocument, Editable, Viewable}}=require("we-edit")

class Javascript extends Editable{
	stream(){
		const stream=new Readable({objectMode:true})
		stream.push(this.doc)
		return stream
	}

	parse({data,...props}){
		//debugger
		this.props=props
		return data=String.fromCharCode.apply(null, new Uint8Array(data))
		return data.split(/\r\n/g)
	}
	
	render(createElement/*(TYPE, props, children, rawcontent)*/,{Document,Paragraph,Text}){
		const rendered=createElement(
			Document,
			{},
			this.doc,
			{id:"root"}
		)
		
		return rendered
	}

	onChange(state,{type,payload}){
		switch(type){
		case "we-edit/entity/UPDATE":
			return state.get("content").set(["root","children"],this.doc=payload)
		}
		return false
	}
}

Javascript.defaultProps={
	type:"javascript",
	name:"javascript",
	ext:"js",
	mimeType:"application/javascript"
}

Javascript.support=function support(file){
	if(arguments.length===0){//for installer
		return true
	}
	const {data,name,ext}=file
	
	const EXTs="txt,log".split(",")
	if(ext && EXTs.includes(ext))
		return true
	
	if(typeof(data)=="string")
		return true
	
	return false
}

const {Office,Workspace}=require("we-edit/office")
const JavascriptWorkspace=(
	<Workspace
		accept={function({props:{name=""}={}}){
			return name.endsWith(".js")
		}}
		key="javascript"
		ruler={false}
		>
		<Editor representation="plain"/>
	</Workspace>
)

//2. Create a representation based on Viewers/Editors
const PlainRepresentation=Object.assign(class extends Representation.Base{
	render(){
		const {type, ...props}=this.props
		return <Representation {...{
			ViewerTypes:{
				Document({children}){
					return <pre style={{textAlign:"initial"}}>{children}</pre>
				}
			},
			EditorTypes:{
				Document({children}){
					return (
						<textarea  style={{textAlign:"initial",height:"100%",width:"100%",padding:10}} defaultValue={children}/>
					)
				}
			},
			...props,
		}}/>
	}
},{
	defaultProps:{
		type:"plain"//must
	}
})



module.exports={
	install(){
		//PlainRepresentation.install()
		//Javascript.install()
		Office.install(JavascriptWorkspace)
	},

	uninstall(){
		//PlainRepresentation.uninstall()
		//Javascript.uninstall()
		Office.install(JavascriptWorkspace)
	}
}
