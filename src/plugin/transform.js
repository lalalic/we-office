import * as babel from 'babel-core'
import rest from "babel-plugin-transform-object-rest-spread"
import jsx from "babel-plugin-transform-react-jsx"
import props from "babel-plugin-transform-class-properties"

export function transform(src){
    const {code}=babel.transform(src,{
        ast:false,
        babelrc:false,
        sourceType:"module",
        sourceMaps:"inline",
        plugins:[
            rest,
            jsx,
            props,
        ]
    })
    const i=code.lastIndexOf("//#")
    const k=code.indexOf('=', i)
    return {code:code.substring(0,i),map:code.substring(k+1)}
}