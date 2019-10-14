import React from "react"
import DocType from "./doc-type"

export default ()=>(
    <div style={{minHeight:"500px", background:"white"}} className="whatis">
        <h1><center>&nbsp;</center></h1>
        {
            [
                [<DocType types={"docx,pptx,indd,html,txt,...".split(",")}/>,"有需要的创作工具",""],
                ["up2date.svg","随时更新跟上创作时代变化",""],
                ["devices.svg","在你所有设备上创作",""],
                ["cloud.svg","作品可在云上",""],
                ["widgets.svg","按需扩展",""]
            ].map(([chart,title,desc],i)=>{
                const ichart=(
                    <div className="chart">
                        {typeof(chart)=="string" ?
                            <img src={`/images/what/${chart}`} onError={e=>e.target.src="/images/logo.png"}/> :
                            chart
                        }
                    </div>
                )
                const idesc=(
                    <div className="desc">
                        <h3>{title}</h3>
                        <p>{desc}</p>
                    </div>
                )
                return (
                    <div key={title} className="what">
                        {i%2==1 ? ichart : idesc}
                        {i%2==0 ? ichart : idesc}
                    </div>
                )
            })
        }
    </div>
)