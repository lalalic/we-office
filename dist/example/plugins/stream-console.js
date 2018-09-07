const {Stream}=require('we-edit')
const React=require("react")

// stream content to console
module.exports=Object.assign(class extends Stream.Base{
	create(){
		return Object.assign(super.create(),{//writable stream
			write(chunk,enc, next){
				console.log(chunk)
			}
		})
	}
	
	render(){
		return "output to console"
	}
},{
	type:"console stream"
})