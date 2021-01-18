import React from "react"
import PropTypes from "prop-types"
import {Loader, Stream, ACTION, getFile, getActive} from "we-edit"
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

    doCreate(){
        return this.props.getDocInfo()
        .then(({checkouted, checkoutByMe, checkoutBy})=>{
            if(!checkouted || checkoutByMe){
                return this.props.save()
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
        this.state={...this.state, autoSave:false}
    }

    render(){
        const {loaded, inited, autoSave}=this.state
        if(loaded && inited){
            return (
                <div style={{position:"fixed",top:4, left:200,height:20}}>
                    <Toggle 
                        label="Auto Save" labelPosition="right" 
                        value={autoSave} defaultToggled={false}
                        style={{zoom:0.6}}
                        onToggle={(e,autoSave)=>this.setState({autoSave})}
                        />
                </div>
            )
        }
        return super.render()
    }

    componentDidUpdate(){
        const {state:{loaded, inited}, context:{store}, props:{interval=60}}=this
        if(loaded && inited && !this.autosaver){
            let changed=false, last
            this.unsubscribeChangeState=store.subscribe(()=>{
                const active=getActive(store.getState())
                if(active){
                    const content=active.state.get('content')
                    if(!last)
                        last=content
                    if(!changed && !content.equals(last)){
                        changed=true
                    }
                }
            })
            this.autosaver=setInterval(()=>{
                if(!this.state.autoSave)
                    return 
                if(changed){
                    this.save().then(a=>changed=false)
                }
            }, 1000*interval)
        }
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
        this.autosaver && clearInterval(this.autosaver)
        this.unsubscribeChangeState && this.unsubscribeChangeState()
        this.docId && this.context.store.dispatch(ACTION.CLOSE(this.docId))
    }

    createReducer({office,needSession}){
        const reducer=super.createReducer(...arguments)
        return (state,action)=>{
            if(!action.isRemote){
                switch(action.type){
                    case "we-edit/init":{
                        office && (state=officeReducer(state,{ type:'we-edit/office', payload:office}));
                        this.setState({inited:true})
                        break
                    }
                }
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

    save(){
        const {store, client}=this.context
        return new Promise((resolve, reject)=>{
            const state=getActive(store.getState()).state
            const stream=getFile(state).stream(), data=[]
            stream.on('readable',a=>{
                while(a=stream.read())
                    data.push(a)
            })
            stream.on('end',()=>resolve(data))
            stream.on('error',reject)
        }).then(data=>{
            return client.runQL(
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