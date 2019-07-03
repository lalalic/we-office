
const React=require("react")
const {Stream}=require('we-edit')

/**
 * it demos how to create an output stream
 */
class ConsoleStream extends Stream.Base{
	static type="console stream"
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
}

module.exports=ConsoleStream