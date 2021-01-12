import React from "react"
import PropTypes from "prop-types"
import {Loader, Stream, ACTION} from "we-edit"
import {requestSubscription} from "react-relay"
import file from "qili-app/components/file"
import {Toggle} from "material-ui"

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

    }

    onFinish(stream){
        const {doc}=this.props
        getToken(doc).then(({token})=>{
            return file.upload(this.data,undefined,undefined,{key},token)
        })
    }
}

export default class SessionLoader extends Loader.Collaborative{
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

    render(){
        const {loaded, autoSave=true}=this.state
        if(loaded){
            return (
                <div style={{position:"fixed",top:4, left:200,height:20}}>
                    <Toggle 
                        label="Auto Save" labelPosition="right" 
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
                            const {checkoutByMe, checkouted, url, needPatchAll, ...payload}=action.payload
                            const loaded={...payload, needPatchAll, onClose:unsubscribe}
                            if(checkouted){
                                unsubscribe()
                                delete loaded.onClose
                                //don't create reducer
                                this.createReducer=()=>state=>state
                            }
                            ;
                            (checkouted||needPatchAll ? fetch(url) : this.context.client.static(url))
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
        this.context.client.send(
            graphql`mutation loaderSession_session_Mutation($doc:String!, $action:JSON!){
                document_session(doc:$doc, action:$action)
            }`,
            {doc:this.props.doc,action}
        )
    }

    componentWillUnmount(){
        if(this.docId){
            this.context.store.dispatch(ACTION.CLOSE(this.docId))
        }
    }
}

