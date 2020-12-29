export const DOMAIN="we-office"

export const ACTION={
	EXTENSIONS: payload=>({
		type:`@@${DOMAIN}/extensions`,
		payload
	}),
	QUERY: payload=>({
		type:`@@${DOMAIN}/QUERY`,
		payload,
	}),
	
	OfficeChanged: payload=>({
		type:`@@${DOMAIN}/OfficeChanged`,
		payload
	}),

	PluginReady: payload=>({
		type:`@@${DOMAIN}/PluginReady`,
		payload
	})
}

export function reducer(state={
		qs:{
			type:[]
		},
		extensions:[],
		officeChanged:0,
	},{type,payload}){
	switch(type){
		case `@@${DOMAIN}/extensions`:
			return {...state, extensions:[...payload]}
		case `@@${DOMAIN}/QUERY`:
			return {...state, qs:{...state.qs,...payload}}
		case `@@${DOMAIN}/OfficeChanged`:
			return {...state, officeChanged:Date.now()}
		case `@@${DOMAIN}/PluginReady`:
			return {...state, pluginLoaded:Date.now()}
	}

	return state
}