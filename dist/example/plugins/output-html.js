const {Representation} = require("we-edit")

class HTML extends Representation.Output.Html{	
	output(content){
		super.output(content)
	}
}

HTML.displayName="HTML"

HTML.defaultProps={
	type:"xhtml",
	name:"XHTML Document",
	ext:"xhtml",
	representation: "html",
	wrapperStart:"<div>",
	wrapperEnd:"</div>"
}

module.exports=HTML
