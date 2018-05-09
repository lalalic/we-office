export const DOMAIN="we-office"

export const ACTION={
	EXTENSIONS: payload=>({
		type:`@@${DOMAIN}/extensions`,
		payload
	}),
	QUERY: payload=>({
		type:`@@${DOMAIN}/QUERY`,
		payload,
	})
}

export function reducer(state={qs:{},extensions:[]},{type,payload}){
	switch(type){
		case `@@{DOMAIN}/extensions`:
			return {...state, extensions:[...payload]}
		case `@@${DOMAIN}/QUERY`:
			return {...state, qs:{...state.qs,...payload}}
	}

	return state
}