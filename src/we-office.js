import React from "react"
import {graphql} from "react-relay"
import {compose, withProps} from "recompose"

import {withInit, QiliApp, ACTION as qiliACTION} from "qili-app"
import project from "../package.json"

import {reducer as weReducer, DOMAIN as weDOMAIN} from "we-edit"

const DOMAIN="we-office"

const ACTION={

}

function reducer(state={},{type,payload}){
	switch(type){

	}

	return state
}

export default compose(
	withProps(()=>({
		project,
		title:"we-office",
		appId:project.config.appId,//get from app.qili2.com
		reducers:{[DOMAIN]:reducer,[weDOMAIN]:weReducer},
		persistStoreConfig:{blacklist:[weDOMAIN]}
		//supportOffline:
		//tutorials:["",""]
		//adUrl:""
	})),
	withInit({
		query:graphql`
			query weOffice_prefetch_Query{
				me{
					id
					token
				}
			}
		`,
		onSuccess(response,dispatch){
			const {me:{ token, id}}=response
			//dispatch(qiliACTION.CURRENT_USER({id,token}))
			//@TODO: to initialize your qili
		},
		onError(error,dispatch){
			dispatch(qiliACTION.LOGOUT)
		}
	}),
)(QiliApp)
