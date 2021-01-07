import PropTypes from "prop-types"
import {Loader, ACTION} from "we-edit"
import {requestSubscription} from "react-relay"

export default class SessionLoader extends Loader.Collaborative{
    static defaultProps={
        ...super.defaultProps,
        type:"session",
        name:"cooperator session",
    }
    static contextTypes={
        ...super.contextTypes,
        store: PropTypes.any,
        client: PropTypes.any,
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
                onNext:({document_session:{worker, action}})=>{
                    switch(action.type){
                        case "we-edit/session-ready":{
                            this.docId=action.payload.id
                            const {checkoutByMe, checkouted, url, ...payload}=action.payload
                            const loaded={...payload, onClose:unsubscribe}
                            if(checkouted){
                                unsubscribe()
                                delete loaded.onClose
                                //don't create reducer
                                this.createReducer=()=>state=>state

                                loaded.noRemoteSave=!checkoutByMe
                            }

                            (checkouted ? fetch(url) : this.context.client.static(url))
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
                                this.onNext(action,{...worker,_id:worker.id.split(":")[1]})
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

