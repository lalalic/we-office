import React from "react"
import {compose,setDisplayName} from "recompose"
import graphql, {withSubscription} from "qili-app/graphql"

export default compose(
    setDisplayName("ping"),
    withSubscription(graphql`subscription ping_ping_Subscription{ping}`),
)(class extends React.Component{
    render(){
        const {ping,unsubscribe}=this.props
        return <div>ping subscription:{ping}, <button onClick={e=>unsubscribe()}>unsubscribe</button></div>
    }

    componentWillUnmount(){
        this.props.unsubscribe()
    }
    
})