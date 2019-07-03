/**
 * it demostrate how to create a document loader, so you can open a document from anywhere
 * when it loaded, when you try to open document, you will see "fetch" in the list of loader
 */
const React=require("react")
const {Loader}=require("we-edit")
module.exports=class extends Loader.Base{
	static getDerivedStateFromProps({url}){
		return {url:url||undefined}
	}

	static defaultProps={
		type:"fetch",
		name:"url loader",
		url:"",
	}

	shouldComponentUpdate(){
		return false
	}

	render(){
		let elUrl
		return (
			<center>
				<div>
					<input ref={a=>elUrl=a}/>
				</div>
				<div>
					<button onClick={e=>this.setState({url:elUrl.value},()=>this.doLoad())}>submit</button>
				</div>
			</center>
		)
	}

	load(){//must
		const {file={}}=this.props
		const {url}=this.state
		return fetch(url)
			.then(res=>res.blob())
			.then(data=>({data,name:"fetcher.docx",ext:"docx",...file}))
	}
}
