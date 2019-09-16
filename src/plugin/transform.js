import * as babel from '@babel/core'
import rest from "@babel/plugin-proposal-object-rest-spread"
import props from "@babel/plugin-proposal-class-properties"
import jsx from "@babel/plugin-transform-react-jsx"

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