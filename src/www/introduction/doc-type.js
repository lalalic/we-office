import React from "react"

export default ({types=[]})=>{
    return (
        <div style={{width:"100%",textAlign:"center"}}>
            {types.map(a=><Doc key={a} type={a}/>)}
        </div>
    )
}

const Doc=({type})=>{
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">
            <path fill="none" d="M0 0h24v24H0V0z"/>
            <text x={6+(type.length%4)} 
                y={16} fontFamily="serif" fontSize={6}>{type}</text>
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
        </svg>
    )
}