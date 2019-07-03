const {Representation} = require("we-edit")

class PDF extends Representation.Output.Pagination{
	static displayName="PDF"
	static defaultProps={
		type:"pdf",
		name:"PDF Document",
		ext:"pdf",
		representation: "pagination"
	}

	constructor(){
		super(...arguments)
		this.inPage=false
	}
	output(content){
		super.output(content)	
	}
	
	onDocument(){
		super.onDocument()
		this.stream.write("<PDF>")
	}
	
	onPage(){
		if(this.inPage){
			this.stream.write("</PAGE>")
		}
		
		this.stream.write("<PAGE>")
		this.inPage=true
	}
	
	onText({text,x=0,y=0,fontSize,fontWeight,fontFamily,fill}){
		this.stream.write(`<text>${text}</text>`)
	}
	
	onImage({width,height,...props}){
		let href=props["xlink:href"]
		this.stream.write(`<image href="${href}"/>`)
	}
	
	onDocumentEnd(){
		this.stream.write("</page>")
		this.stream.end("</PDF>")
		super.onDocumentEnd()
	}
}

module.exports=PDF