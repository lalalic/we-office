import React, {Component,Fragment} from "react"
import PropTypes from "prop-types"
import {withQuery,withFragment,withMutation} from "qili-app/graphql"
import {compose, withProps, getContext} from "recompose"
import {List, ListItem, RaisedButton,Divider,SvgIcon, IconButton,IconMenu,MenuItem} from "material-ui"
import file from "qili-app/components/file"
import {Input} from "we-edit"

import FolderIcon from 'material-ui/svg-icons/file/folder-open'
import RightIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-right'

import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';

export default class Tasks extends Component{
    static contextTypes={
        router: PropTypes.any,
    }
    static install(){

    }

    static isDashboard=true

    render(){
        return <Documents folder={this.context.router.params.folder}/>
    }
}


const Documents=compose(
    getContext({
        router:PropTypes.object,
        client: PropTypes.any,
    }),
    withQuery(({folder})=>{
        return {
            query:graphql`query dashboardTasks_documents_Query($folder:String){
                me{
                    documents(filter:$folder){
                        ...dashboardTasks_document
                    }
                }
            }`,
            variables:{folder},
        }
    }),
    withProps(({data,router:{params:{folder}}})=>({
        documents:data.me.documents,
        folder,
    })),
    withFragment({
        documents:graphql`fragment dashboardTasks_document on Document @relay(plural: true){
            id
            name
            type
            isMine
            checkouted
            checkoutByMe
            shared
            checkoutBy{
                name
            }
            shareBy{
                name
            }
            workers{
                name
            }
		}`
    }),
    withMutation({
        name:"checkin",
        mutation:graphql`mutation dashboardTasks_checkin_Mutation($doc:String!){
            checkin_document(id:$doc){
                ...dashboardTasks_document
            }
        }`
    }),
    withMutation({
        name:"checkout",
        mutation:graphql`mutation dashboardTasks_checkout_Mutation($doc:String!){
            checkout_document(id:$doc){
                ...dashboardTasks_document
            }
        }`
    }),
    withMutation({
        name:"share",
        mutation:graphql`mutation dashboardTasks_share_Mutation($doc:String!, $to:String!){
            share_document(id:$doc, to:$to){
                ...dashboardTasks_document
            }
        }`
    }),
    withMutation({
        name:"unshare",
        mutation:graphql`mutation dashboardTasks_unshare_Mutation($doc:String!, $to:String){
            unshare_document(id:$doc, to:$to){
                ...dashboardTasks_document
            }
        }`
    }),
    withMutation((props,{doc})=>({
        name:"remove",
        mutation:graphql`mutation dashboardTasks_delete_Mutation($doc:String!){
            delete_document(id:$doc)
        }`,
        delete4: doc
    })),
    withMutation({
        name:"save",
        mutation:graphql`mutation dashboardTasks_save_Mutation($doc:String!){
            save_document(id:$doc){
                token
                id
            }
        }`
    }),
    
    file.withUpload,
)(
    class extends Component{
        static defaultProps={
            linkStyle:{textDecoration:"none"},
            commentStyle:{marginRight:10},
        }
        constructor(){
            super(...arguments)
            this.state={target:null}
        }
        renderPath(){
            const {props:{linkStyle, router, folder=""}}=this
            return (
                <Fragment>
                    <a style={linkStyle} onClick={e=>router.push("/documents")}>my documents</a>
                    <span>{" > "}</span>
                    {
                        (()=>{
                            const els=folder.split("/").filter(a=>a)
                                .map((f,i,folders)=>{
                                    const href=folders.slice(0,i+1).join("/")
                                    return [
                                        <a style={linkStyle} key={href} onClick={e=>router.push(`/documents/${href}`)}>{f}</a>,
                                        <span key={i}>{" > "}</span>
                                        ]
                                }).flat()
                            els.pop()
                            return els    
                        })()
                    }
                </Fragment>
            )
        }

        renderActions({id, type, checkouted, checkoutByMe, isMine, shared}){
            const {state:{target}, props:{unshare, checkout, checkin, share, save, remove, upload}}=this
            const iconButtonElement = (
                <IconButton
                  touch={true}
                  tooltip="more"
                  tooltipPosition="bottom-left"
                >
                  <MoreVertIcon/>
                </IconButton>
              );

            const unset=()=>this.setState({target:null})
            
            return (
                <IconMenu open={target==id} desktop={true}
                    iconButtonElement={iconButtonElement} 
                    onClick={e=>this.setState({target:id})}>
                    <MenuItem disabled={!!checkouted} onClick={e=>{
                        unset()
                        checkout({doc:id})
                    }}>Check Out</MenuItem>

                    <MenuItem disabled={!(checkouted && checkoutByMe)} onClick={e=>{
                        unset()
                        checkin({doc:id})
                    }}>Check In</MenuItem>
                    <Divider/>

                    <MenuItem disabled={!isMine} onClick={e=>{
                        const contact=window.prompt("account","13911630203")
                        if(!contact)
                            return 
                            unset()
                        share({doc:id, to:contact})
                    }}>Share To...</MenuItem>
                    
                    <MenuItem disabled={!(isMine && shared)} onClick={e=>{
                        const contact=window.prompt("account","13911630203")
                        if(!contact)
                            return 
                        
                        unset()
                        unshare({doc:id, to:contact})
                    }}>Unshare To ...</MenuItem>

                    <MenuItem disabled={!(isMine && shared)} onClick={e=>{
                        unset()
                        unshare({doc:id})
                    }}>Unshare to All</MenuItem>

                    <Divider/>
                    
                    
                    <MenuItem disabled={!isMine} onClick={e=>{
                        unset()
                        remove({doc:id})
                    }}>Delete</MenuItem>

                    <MenuItem disabled={checkouted && !checkoutByMe} onClick={e=>{
                        unset()
                        save({doc:id}).then(({token,id:key})=>{
                            file.select().then(data=>{
                                const {name,size,lastModified}=data
                                return upload(data,undefined, undefined,{key,name,size,lastModified},token)
                            })
                        })
                            
                    }}>Upload</MenuItem>
                </IconMenu>
            )
        }

        render(){
            const {state:{target}, props:{documents, router, linkStyle,commentStyle}}=this
            return (
                <div style={{flex:1, display:"flex", flexDirection:"column"}} onClick={e=>this.setState({target:null})}>
                    <List style={{flex:1, marginRight:20, marginLeft:20}}>
                        <ListItem leftIcon={<span/>} primaryText={this.renderPath()} />
                        <Divider />
                        {documents.map(({id,name,type,workers,checkoutBy, shareBy, checkouted, checkoutByMe, isMine, shared})=>
                        [
                            <ListItem key={id} 
                                leftIcon={type=="folder" ? <FolderIcon style={{width:36,height:36,margin:4}}/> : <DocType type={type}/>}
                                primaryText={
                                    type=="folder" ?
                                    <a onClick={e=>router.push(`/documents/${id}`)} style={linkStyle}><strong>{name}</strong></a> :
                                    <a onClick={e=>router.push(`/load/session/${id}`)} style={linkStyle}><strong>{name}</strong></a>
                                } 
                                secondaryText={
                                    <div>
                                        <span style={commentStyle}>
                                            {isMine && shared ? "shared" : shareBy ? `shared by ${shareBy.name}` : ""}
                                        </span>

                                        <span style={{...commentStyle, color: "brown"}}>
                                            {checkoutByMe ? "checkouted" : checkoutBy ? `checkouted by ${checkoutBy.name}` : ""}
                                        </span>
                                        
                                        <span style={{...commentStyle, color: "chocolate"}}>
                                            {workers?.length ? `${workers.map(a=>a.name).join(",")} ${workers.length==1? 'is' : 'are'} editing` : " "}
                                        </span>
                                    </div>
                                }
                                rightIconButton={type!=="folder" ?  this.renderActions({id,type,checkouted, checkoutByMe, isMine, shared}) : <IconButton/>}
                                />,
                            <Divider key={`${id}-`}/>
                        ]
                        )}
                    </List>
                    <div style={{textAlign:'center', paddingBottom:5}}>
                        <RaisedButton label="upload" onClick={e=>this.upload()}/>
                    </div>
                </div>
            )
        }

        upload(){
            const exts=Array.from(Input.supports.values()).map(a=>a.defaultProps.ext).filter(a=>a)
            const {upload, getToken, folder=""}=this.props
            file.select("."+exts.join(",."))
                .then(file=>{
                    const {name,size,lastModified}=file
                    const key=`documents/${folder}/${name}`.replace(/\/\//g,"/")
                    return getToken(key).then(({token,_id})=>{
                        return upload(file,undefined, undefined,{key, name,size,lastModified},token)
                    })
                })
        }
    }

)

const DocType=({type, style, T=type[0].toUpperCase(),...props})=>(
    <SvgIcon {...props} style={{...style, width:36,height:36,margin:4}}>
        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
        <path strokeWidth={1.3} stroke="lightgray" d={"M8 10h4 m-4 2 h4 m-4 2 h4  m-4 2 h4 M13 10 h4 m-4 2 h4 m-4 2 h4  m-4 2 h4"}/>
        <rect {...{x:0,y:8,width:10,height:10,fill:COLOR(type,T)}}/>
        <text x={3} y={15.5} fontFamily="serif" fontSize={8} fill="white">{T}</text>
    </SvgIcon>
)

const COLOR=Object.assign(function(type,t=type[0].toUpperCase()){
    switch(type.toLowerCase()){
        default:
            return COLOR[t]||COLOR.all[t.charCodeAt(0)%COLOR.all.length]
    } 
},{
    all:"blue,brown,blueviolet,darkcyan,crimson,chocolate".split(","),
    D:"blueviolet",
    P:"crimson",
    X:"chocolate"
})