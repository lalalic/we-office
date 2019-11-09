import React,{Fragment} from "react"
import Tutorial from "./tutorial"
import Features from "./features"

export default props=>(
    <Fragment>
        <Tutorial {...props}/>
        <Features/>
    </Fragment>
)