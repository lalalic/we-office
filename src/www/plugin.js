import React from "react"
import { compose } from "recompose"
import {withFragment} from "qili-app/graphql"
import Markdown from "react-markdown"

export default compose(
    withFragment({plugin:graphql`fragment plugin_plugin_anonymous on Plugin{
		id
		name
        type
		description
        readme
		version
		
        author{
            id
            name
        }
	}`}),
)(
    ({plugin:{name,version,description,type,readme,author:{name:author}}})=>(
        <div style={{margin:50}}>
            <h4>{name}</h4>
            <div>类型:{type}, 版本:{version}, 作者:{author}</div>
            <p>{description}</p>
            <Markdown source={readme}/>
        </div>
    )
)