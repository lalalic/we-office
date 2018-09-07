const React=require("react")
const {Representation, Emitter, Editor,Input:{Editable}}=require("we-edit")
const {Office,Workspace}=require("we-edit/office")


//1. At first create Viewers and Editors, and must give displayName "[(xxx-)*](we-edit-model-name)"
const Viewers={
	Document:Object.assign(({children})=>children,{
		displayName:"text"//must
	})
}

const Editors={
	Document:Object.assign(class extends React.Component{
			render(){
				const {children}=this.props
				const {store}=this.context
				
				return React.createElement("textarea",{
					ref:a=>this.editor=a,
					value:children,
					style:{
						width:500,height:"80%", 
						margin:10,padding:5, 
						fontFamily:"Arial,Helvetica,sans-serif", 
						fontSize:"11pt", 
						lineHeight:"140%"
					},
					onChange({target:{value}}){
						store.dispatch({type:"we-edit/content",payload:value})//type must be "we-edit/xxx"
					}
				})
			}
			
			goodLook(){
				const {width,height}=this.editor.parentNode.getBoundingClientRect()
				this.editor.style.width=width-10
				this.editor.style.height=height-10
				this.editor.parentNode.style.textAlign="center"
				this.editor.focus()
			}
			
			componentDidMount(){
				this.goodLook()
			}
			
			componentDidUpdate(){
				this.goodLook()
			}
		},
		{
			displayName:"text",//must
			contextTypes:{
				store(){//PropTypes.any
					return null
				}
			}
		}
	)
}


//2. Create a representation based on Viewers/Editors
const PlainRepresentation=Object.assign(class extends Representation.Base{
	render(){
		return React.createElement(Representation, {ViewerTypes:Viewers,EditorTypes:Editors,...this.props})
	}
},{
	defaultProps:{
		type:"plain"//must
	}
})

//3. Create a input to parse and render 
const PlainInput=Object.assign(class extends Editable{
	parse({data,...props}){
		this.props=props
		return {data:String.fromCharCode.apply(null, new Uint8Array(data))}
	}
	
	render(createElement,{Document}){
		return createElement(Document,{},this.doc.data)
	}
	
	makeId(node){
		return "root"
	}
	
	stream(){
		let data=this.doc.data
		return {
			pipe(writeStream){
				(this.piped=writeStream).write(data)
				return this
			},
			
			push(a){
				if(!a){
					this.piped.end()
				}else{
					this.piped.write(a)
				}
			}
		}
	}
	
	onChange(state,{type,payload}){//it's a redux reducer, to keep source and state sync change
		switch(type){
			case "we-edit/content":
				return state.setIn(["content","root","children"],this.doc.data=payload)
			break
		}
		return false
	}
},{
	support(file){//test what file can be supported by this Input, if no argument, test platform(nodejs/web) surportability
		if(!file){//for installer
			return true
		}
		
		const {data/*must,usually a stream/arrayBuffer*/,name,ext,mimeType}=file
		
		const EXTs="txt,log".split(",")
		if(ext && EXTs.includes(ext))
			return true
		
		if(typeof(data)=="string")
			return true
		
		return false
	},
	defaultProps:{
		type:"plain text",//must
		name: "my plain text",
		ext: "txt"
	}
})

//4. Create an office workspace for plain text file
const PlainOffice={
	workspaces:[
		React.createElement(
			Workspace,
			{
				accept:PlainInput,
				key: "txt",
				layout: "edit"
			},
			React.createElement(Editor, {
				layout: "edit",
				toolBar: null,
				icon: null,
				representation: "plain"
			})
		)
	]
}


//6. export install to install all above components
module.exports.install=function(){
	PlainRepresentation.install()
	PlainInput.install()
	Office.install(PlainOffice)
}

module.exports.uninstall=function(){
	PlainRepresentation.uninstall()
	PlainInput.uninstall()
	Office.uninstall(PlainOffice)
}