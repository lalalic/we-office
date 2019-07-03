const {Representation} = require("we-edit")

class HTML extends Representation.Output.Html{	
	static displayName="HTML"
	static defaultProps={
		type:"xhtml",
		name:"XHTML Document",
		ext:"xhtml",
		representation: "html",
		wrapperStart:"<div>",
		wrapperEnd:"</div>"
	}
	
	output(content){
		super.output(content)
	}
}

module.exports=HTML
