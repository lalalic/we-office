
const TextEditor=compose(
	setDisplayName("TextEditor"),
	connect(state=>{
		let {text}=state[KEY]
		return text
	}),
)((props)=>(<Editor {...props}/>))

const TextEditorTool=compose(
	setDisplayName("TextEditorTool"),
	connect(state=>{
		let {text}=state[KEY]
		return text
	},dispatch=>{
		return {
			toggle(k){
				dispatch({type:`${DOMAIN}/${KEY}/text/toggle`,payload:k})
			}
		}
	})
)(({toggle,wrap,colorful})=>
	<div style={{lineHeight:"30px"}}>
		<span>
			<input type="checkbox" checked={wrap} onChange={()=>toggle("wrap")}/>
			<span>wrap</span>
		</span>
		<span>
			<input type="checkbox" checked={colorful} onChange={()=>toggle("colorful")}/>
			<span>color</span>
		</span>
	</div>
)

const VariantEditorTool=compose(
	setDisplayName("VariantEditorTool"),
	connect(state=>{
		let {variant}=state[KEY]
		return variant
	}, dispatch=>{
		return {
			toggle(k){
				dispatch({type:`${DOMAIN}/${KEY}/variant/toggle`,payload:k})
			}
		}
	})
)(({toggle, assemble})=>(
	<div style={{lineHeight:"30px"}}>
		<span>
			<input type="checkbox" checked={assemble} onChange={()=>toggle("assemble")}/>
			<span>assemble</span>
		</span>
	</div>
))

const VariantEditor=compose(
	setDisplayName("VariantEditor"),
	connect(state=>{
		let {variant}=state[KEY]
		return variant
	}),
)(({assemble, representation, ...props})=>{
	props.representation= !assemble ? React.cloneElement(representation,{variants:null, key:assemble}) : representation
	return <Editor {...props}/>
})

const reducer=(state={
		text:{
			wrap:true,
			colorful:false,
			size:12,
			fonts:"calibri",
			lineHeight:"140%",
		},
		variant:{
			assemble:true
		}
	},{type,payload})=>{
		switch(type){
			case `${DOMAIN}/${KEY}/text/toggle`:{
				return {...state, text:{...state.text, [payload]:!state.text[payload]}}
			}
			case `${DOMAIN}/${KEY}/variant/toggle`:{
				return {...state, variant:{...state.variant, [payload]:!state.variant[payload]}}
			}
			default:
				return state
		}
	}