import React,{Fragment} from "react"
import Helmet from "react-helmet"

class ScrollFade extends React.Component{
    static defaultProps={
        max:200
    }
    constructor(){
        super(...arguments)
        this.state={}
        this.scroll=this.scroll.bind(this)
    }

    get scroller(){
        return this.props.scroller||window
    }

    scroll(){
        this.setState({opacity:1-Math.min(window.scrollY/this.props.max,1)})
    }

    componentDidMount(){
        this.scroller.addEventListener("scroll",this.scroll)
    }

    render(){
        const {opacity=1}=this.state
        const {children}=this.props
        const child=React.Children.toArray(children)[0]
        if(!child)
            return child||null

        const {style={}}=child.props
        return React.cloneElement(child,{style:{...style,opacity}})
    }

    componentWillUnmount(){
        this.scroller.removeEventListener("scroll",this.scroll)
    }
}

export default ({children, ...props})=>{
    const app="https://app.wenshubu.com"
    return (
        <Fragment>
            <Helmet>
				<title>文书部</title>
				<meta name="description" content="文书处理的云平台"/>
				<meta name="keywords" content="document,file,convert,doc,docx,ppt,pptx,indd,文档,文书,文件,格式转换"/>
			</Helmet>
            <ScrollFade max={400}>
                <header style={{clear:"both",zIndex:2,position:"fixed",top:0,width:"100%",height:50,lineHeight:"50px",display:"flex",flexDirection:"row",backgroundColor:"#303848",color:"white"}}>
                    <div style={{flex:"none",margin:"auto"}}>
                        <a href="/">
                            <img src="/images/logo.png" style={{width:30,height:30,paddingTop:10}}/>
                            <strong style={{float:"right"}}>文书部</strong>
                        </a>
                    </div>
                    <nav>
                        
                    </nav>

                    <div style={{flex:"none",paddingRight:20,margin:"auto"}}>
                        <a href={app}
                            style={{textDecoration:"none",padding:10,whiteSpace:"nowrap", borderRadius:5, border:"1px solid white",background:'transparent',color:"white"}}>
                            登录/注册
                        </a>
                    </div>
                </header>
            </ScrollFade>
            {children}
            <footer>
                <nav>
                    <div>
                        <h4>动态</h4>
                        <ul>
                            <li><strong>{5}</strong>个扩展</li>
                            <li>Blog</li>
                            <li>微博</li>
                            <li>微信公众号</li>
                            <li>Slack</li>
                        </ul>
                    </div>

                    <div>
                        <h4>开发者</h4>
                        <ul>
                            <li>如何成为开发者</li>
                            <li>we-edit概念</li>
                            <li>Office概念</li>
                            <li>实战</li>
                            <li>开发部落</li>
                            <li>github</li>
                        </ul>
                    </div>

                    <div>
                        <h4>公司</h4>
                        <ul>
                            <li>关于我们</li>
                            <li>加入我们</li>
                            <li>公司新闻</li>
                            <li>隐私政策</li>
                            <li>欢迎投资</li>
                        </ul>
                    </div>
                </nav>
                
                <div style={{flex:"none",borderTop:"1px solid gray"}}>
                    <p>
                        <span>© {new Date().getFullYear()} 文书部</span>
                        <span style={{float:"right"}}>京ICP备15008710号-3</span>
                    </p>
                </div>
            </footer>
        </Fragment>
    )
}