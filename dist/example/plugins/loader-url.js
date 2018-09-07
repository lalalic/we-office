const React=require("react")
const {Loader}=require("we-edit")


module.exports=Object.assign(class extends Loader.Base{
	shouldComponentUpdate(){
		return false
	}
	
	render(){
		let elUrl
		/*
			<center>
				<div>
					<input ref={a=>elUrl=a}/>
				</div>
				<div>
                  	<button onClick={e=>this.setState({url:elUrl.value},()=>this.doLoad())}>
						submit	
					/button>
                </div>
			</center>		
		*/
		return React.createElement(
			  "center",
			  null,
			  React.createElement(
				"div",
				null,
				React.createElement("input", { ref: a => (elUrl = a) })
			  ),
			  React.createElement(
				"div",
				null,
				React.createElement(
				  "button",
				  {
					onClick: e => this.setState({ url: elUrl.value }, () => this.doLoad())//you have to call this.doLoad somewhere
				  },
				  "submit"
				)
			  )
			);

	}
	
	load(){//must 
		const {url}=this.state
		return fetch(url)
			.then(res=>res.blob())
			.then(data=>({data,name:"fetcher.docx",ext:"docx"}))
	}
},{
	getDerivedStateFromProps({url}){
		return url ? {url} : null
	},
	
	defaultProps:{
		type:"fetch",
		name:"url loader",
		url:"",
	}
})