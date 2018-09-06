const {Input:{EditableDocument, Editable, Viewable}}=require("we-edit")

class Text extends Viewable{
	parse({data,...props}){
		this.props=props
		data=String.fromCharCode.apply(null, new Uint8Array(data))
		return data.split(/\r\n/g)
	}
	
	render(createElement/*(TYPE, props, children, rawcontent)*/,{Document,Paragraph,Text}){
		let rendered=createElement(
			Document,
			{},
			this.doc.map((t,i)=>createElement(Paragraph,{},[createElement(Text,{},t,`${i}t`)],`${i}p`))
		)
		
		return rendered
	}
	
	makeId(node){
		return node
	}
}

Text.defaultProps={
	type:"text",
	name:"plain text document",
	ext:"txt",
	mimeType:"plain text"
}

Text.support=function(){
	if(arguments.length==0){//for installer
		return true
	}
	const {data,name,ext}=arguments[0]
	
	const EXTs="txt,log".split(",")
	if(ext && EXTs.includes(ext))
		return true
	
	if(typeof(data)=="string")
		return true
	
	return false
}

module.exports=Text
