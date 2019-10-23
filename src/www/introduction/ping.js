import React from "react"
import {compose,setDisplayName} from "recompose"
import {withSubscription} from "qili-app/graphql"

export default compose(
    setDisplayName("ping"),
    withSubscription({
        subscription:graphql`subscription ping_ping_Subscription{
            ping
        }`,
        onCompleted(){
            console.log("subscription closed by server")
        },
        onError(e){
            console.log("subscription error")
            console.error(e)
        },
        onUpdate(){
            console.log("subscription updated")
        }
    })
)(({ping})=><div>ping subscription:{ping}</div>)