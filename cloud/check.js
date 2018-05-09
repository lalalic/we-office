module.exports=function check(code){
	let types=new Set()
	let module={exports:{}}
	let f=name=>({support(){types.add(name)}});
	
	new Function("module,exports,Input,Loader,Emitter,Representation,Output,Ribbon",code)(
			module,
			module.exports,
			f("Input"),
			f("Loader"),
			f("Emitter"),
			f("Representation"),
			f("Output"),
			f("Ribbon")
		);
		
	let exports=module.exports
	if(!exports)
		throw new Error("plugin must be a commonjs module with exports")
	
	let empty="name,description,version"
		.split(",")
		.filter(a=>!exports[a])
		
	if(empty.length!=0)
		throw new Error(`plugin must export ${empty.join(",")}!`)
	
	types=Array.from(types)
	if(types.length==0)
		throw new Error(`plugin must type of !`)
	
	return exports
}