import React from "react"
import Tutorial from "qili-app/components/tutorial"

export default props=>{
    const mediaBackgroundStyle={
        height:'calc(100% - 30px)',
        paddingTop:10,
    }
    const contentStyle={
        overflowY:"hidden",
    }
    return (
        <Tutorial
            style={{height:500,zIndex:"initial",position:"initial",backgroundColor:"cornflowerblue"}}
            label="立即使用"
            onStart={()=>location="https://app.wenshubu.com"}
            slides={
                [
                    {
                        media:`/images/tutorial/1.png`,
                        mediaBackgroundStyle,
                        contentStyle,
                    },
                    {
                        media:`/images/tutorial/2.png`,
                        mediaBackgroundStyle,
                        contentStyle,
                    },
                    {
                        media:`/images/tutorial/3.png`,
                        mediaBackgroundStyle,
                        contentStyle,
                    },
                    {
                        media:`/images/tutorial/4.png`,
                        mediaBackgroundStyle,
                        contentStyle,
                    },
                ]
            }
            {...props}/>
    )
}