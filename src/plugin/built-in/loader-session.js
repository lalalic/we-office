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
                        case "we-edit/session-ready":
                            this.context.client.static(action.payload.url)
                                .then(response=>response.blob())
                                .then(data=>{
                                    this.docId=action.payload.id
                                    return {data, ...action.payload, onClose:unsubscribe}
                                })
                                .then(resolve,reject)
                            break
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

