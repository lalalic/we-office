import React,{PureComponent} from "react"
import Markdown from "react-markdown"
import readme from "./readme"

export default class Dev extends PureComponent{
    constructor(){
        super(...arguments)
        this.state={readme}
    }

    render(){
        const {readme={},active=""}=this.state
        const Li=({children,m})=><li className={m==active ? "activeLink" :""} onClick={e=>this.setState({active:m})}>{children}</li>
        return (
            <div className="dev" style={{display:"flex",flexDirection:"row"}}>
                <ul style={{paddingRight:20,minWidth:"200px"}} >
                    <Li m="core">we-edit</Li>
                    <Li m="pagination">pagination representation</Li>
                    <Li m="html">html representation</Li>
                    <Li m="text">text representation</Li>
                    <Li m="plain">plain representation</Li>
                    <Li m="docx">docx input</Li>
                    <Li m="json">json/xml input</Li>
                    <Li m="variant">variant</Li>
                    <Li m="office">office</Li>
                </ul>
                <div>
                    <Markdown source={readme[active]}/>
                </div>
            </div>
        )
    }
}
