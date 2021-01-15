import React from "react"
import PropTypes from "prop-types"
import {Loader, Stream, ACTION} from "we-edit"
import {reducer as officeReducer} from "we-edit/office"
import {requestSubscription} from "react-relay"
import file from "qili-app/components/file"
import {Toggle} from "material-ui"
import { graphql } from "graphql"

class SessionSaver extends Stream.Base{
    static defaultProps={
        ...super.defaultProps,
        type:"session",
        name:"Remote Save"
    }

    componentDidMount(){
        this.doCreate()
    }

    write(chunk, encoding, callback){
        (this.data||(this.data=[])).push(chunk)
        callback()
    }

    onFinish(stream){
        this.props.save(this.data)
    }

    doCreate(){
        return this.props.getDocInfo()
        .then(({checkouted, checkoutByMe, checkoutBy})=>{
            if(!checkouted || checkoutByMe){
                return super.doCreate()
            }else{
                throw new Error(`you can't save because ${checkoutBy.name} already checkouted`)
            }
        })
    }
}

class SessionLoader extends Loader.Collaborative{
    static defaultProps={
        ...super.defaultProps,
        type:"session",
        name:"Collaborative Session",
    }
    static contextTypes={
        ...super.contextTypes,
        store: PropTypes.any,
        client: PropTypes.any,
    }

    constructor(){
        super(...arguments)
        this.save=this.save.bind(this)
        this.getDocInfo=this.getDocInfo.bind(this)
    }

    render(){
        const {loaded, autoSave=true}=this.state
        if(loaded){
            return (
                <div style={{position:"fixed",top:4, left:200,height:20}}>
                    <Toggle 
                        label="Auto Save1" labelPosition="right" 
                        value={autoSave} defaultToggled={true}
                        style={{zoom:0.6}}
                        onToggle={(e,autoSave)=>this.setState({autoSave},()=>{
                            this.remoteDispatch({type:'we-edit/collaborative/autosave',payload:this.state.autoSave})
                        })}
                        />
                </div>
            )
        }
        return super.render()
    }

    load(){
        const {context:{client}, props:{doc}}=this
        const inited=new Promise((resolve, reject)=>{
            const {dispose:unsubscribe}=requestSubscription(
                client,
                {
                subscription:graphql`subscription loaderSession_session_Subscription($doc:String!){
                    document_session(doc:$doc){
                        worker{
                            id
                            name
                        }
                        action
                    }
                }`,
                variables:{doc},
                onNext:({document_session})=>{
                    if(!document_session)
                        return 
                    const {worker={}, action}=document_session
                    switch(action.type){
                        case "we-edit/session-ready":{
                            this.docId=action.payload.id
                            const {needSession, initiating, checkoutted, checkoutByMe, url, ...payload}=action.payload
                            const loaded={
                                ...payload, 
                                needPatchAll:initiating, 
                                onClose:unsubscribe, 
                                needSession, 
                                office:{stream:{
                                    type:'session',
                                    getDocInfo:this.getDocInfo, 
                                    save:this.save
                                }}
                            }

                            if(!needSession){
                                unsubscribe()
                                delete loaded.onClose
                            }

                            ;
                            (!needSession||initiating ? fetch(url) : this.context.client.static(url))
                                .then(response=>response.blob())
                                .then(data=>{
                                    loaded.data=data
                                    return loaded
                                })
                                .then(resolve,reject)
                            break
                        }
                        default:
                            inited.then(()=>{
                                this.onNext(action,{...worker,_id:worker?.id.split(":")[1]})
                            })
                    }
                }
            })
        })

        return inited
    }

    remoteDispatch(action){
        this.context.client.publish(
            graphql`mutation loaderSession_session_Mutation($doc:String!, $action:JSON!){
                document_session(doc:$doc, action:$action)
            }`,
            {doc:this.props.doc,action}
        )
    }

    patch(){
        return super.patch(...arguments)
			.then(patch=> patch && this.remoteDispatch({type:'we-edit/collaborative/save', payload:patch}))
    }

    componentWillUnmount(){
        if(this.docId){
            this.context.store.dispatch(ACTION.CLOSE(this.docId))
        }
    }

    createReducer({office,needSession}){
        const reducer=super.createReducer(...arguments)
        return (state,action)=>{
            if(!action.isRemote && action.type=='we-edit/init' && office){
                state=officeReducer(state,{ type:'we-edit/office', payload:office})
            }
            return needSession ? reducer(state,action) : state
        }
    }

    getDocInfo(){
        const {props:{doc}, context:{client}}=this
        return client.runQL(
            graphql`query loaderSession_doc_Query($doc:String!){
                me{
                    document(id:$doc){
                        checkouted
                        checkoutByMe
                        checkoutBy{
                            name
                        }
                    }
                }
            }`,
            {doc}
        ).then(({data})=>data.me.document)
    }

    save(data){
        return this.context.client.runQL(
            graphql`mutation loaderSession_doc_Mutation($doc:String!){
                    save_document(id:$doc){
                        token
                        id
                    }
            }`,
            {doc:this.props.doc},
        ).then(({data:{save_document:{token,id:key}}})=>{
            return file.upload({data:new Blob(data),key,lastModified:new Date(),token})
        })
    }
}

export default{
    install(){
        SessionLoader.install()
        SessionSaver.install()
    },

    uninstall(){
        SessionLoader.uninstall()
        SessionSaver.uninstall()
    }
}