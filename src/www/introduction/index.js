import React,{Fragment} from "react"
import Tutorial from "./tutorial"
import Features from "./features"
import Ping from "./ping"

export default props=>(
    <Fragment>
        <Tutorial {...props}/>
        <Features/>
        <Ping/>
    </Fragment>
)