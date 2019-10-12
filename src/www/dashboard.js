import React,{Fragment} from "react"
import Tutorial from "qili-app/components/tutorial"
import Helmet from "react-helmet"
import What from "./what"

export default ({children, routes:[root],location:{pathname},...props})=>{
    return (
        <Fragment>
            <Helmet>
				<title>文书部</title>
				<meta name="description" content="文书处理的云平台"/>
				<meta name="keywords" content="document,file,convert,doc,docx,ppt,pptx,indd,文档,文书,文件,格式转换"/>
			</Helmet>
            <header style={{clear:"both",zIndex:2,position:"fixed",top:0,width:"100%",height:50,lineHeight:"50px",display:"flex",flexDirection:"row",backgroundColor:"#303848",color:"white"}}>
                <div style={{flex:"none",paddingLeft:20,margin:"auto"}}>
                    <a href="/">
                        <img src="/images/logo.png" style={{width:30,height:30,padding:10}}/>
                        <strong style={{float:"right"}}>文书部</strong>
                    </a>
                </div>

                <div style={{flex:"none",paddingRight:20,margin:"auto"}}>
                    <a href="https://app.wenshubu.com" style={{textDecoration:"none",padding:10,whiteSpace:"nowrap", borderRadius:5, border:"1px solid white",background:'transparent',color:"white"}}>
                        登录/注册
                    </a>
                </div>
            </header>

            <Tutorial 
                    style={{height:500,zIndex:"initial",position:"initial",marginTop:50}}
                    label={null}
                    slides={
                        [
                            {
                                media:`/images/tutorial/time.png`,
                                mediaBackgroundStyle:{
                                    height:'calc(100% - 60px)'
                                },
                                title: "时间管理"
                            },
                            {
                                media:`/images/tutorial/score.png`,
                                mediaBackgroundStyle:{
                                    height:'calc(100% - 60px)'
                                },
                                title:"激励积分"
                            },
                            {
                                media:`/images/tutorial/knowledge.png`,
                                mediaBackgroundStyle:{
                                    height:'calc(100% - 60px)'
                                },
                                title:"发现分享"
                            }
                        ]
                    }
                    {...props}/>
                    
            <div style={{minHeight:"500px", background:"white"}} className="whatis">
                <h1><center>文书部是什么?</center></h1>
                {
                    [
                        ["","你需要的创作工具",""],
                        ["","总是最新的",""],
                        ["","在你所有的设备上都可以完成创作",""],
                        ["","随时分享你的作品，在云上",""],
                        ["","随你所需的扩展",""]
                    ].map(([chart,title,desc],i)=>{
                        const ichart=(
                            <div className="chart">
                                <img src={chart||"/images/logo.png"}/>
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

            <footer style={{padding:10,background:"#303848",color:"white", display:"flex",flexDirection:"column"}}>
                <div style={{flex:"1 1 100%"}}>

                </div>
                <div style={{flex:"none",borderTop:"1px solid gray", fontSize:"small"}}>
                    <p>
                        <span>© 2019 文书部</span>
                        <span style={{float:"right"}}>京ICP备15008710号-3</span>
                    </p>
                </div>
            </footer>
        </Fragment>
    )
}