/**
it's to customize docx workspace, you would see the following change after this plugin loaded:
> when you create document, you  can see a template named myDocx
> there are tabs of Draw,Design,References,Review,View,Developer,xPression when you open a docx
> there is input at end of tabs when you open a docx
> a document tree shown at right side
**/

const React=require("react")
const {Editor,DocumentTree}=require("we-edit")
const {Office, Workspace, Ribbon}=require("we-edit/office")
const {SvgIcon,ToolbarGroup,Tabs, Tab}=require("material-ui")
const {connect}=require("react-redux")
const minimatch=require("minimatch")

const Docx=require("input-docx")
const {Provider}=require("variant")
const {Fragment}=React

const KEY="test"

const Tree=({data, filter="*", node})=>{
    filter=(filter=>{
        if(typeof(filter)=="string"){
            let glob=filter
            filter=key=>minimatch(`${key}`,glob)
        }

        if(typeof(filter)=="function")
            return filter

        return a=>!!filter
    })(filter);

    const toArray=a=>Object.keys(a).map(k=>[k,a[k]])
    const createElement=(value,key)=>{
        let children=typeof(value)=="object"&&value ? (Array.isArray(value) ? value.map((v,i)=>[i,v]) : toArray(value)) : null

        if(key=="root" || filter(key,value)){
            return React.cloneElement(
                node,
                {name:key, value, key},
                Array.isArray(children) ? create4Children(children) : children
            )
        }else{
            return Array.isArray(children) ? create4Children(children) : null
        }
    }

    const create4Children=children=>{
            children=children
                .map(([key,value])=>createElement(value,key))
                .filter(a=>!!a && (Array.isArray(a) ? a.length>0 : true))
                .reduce((all,a)=>{
                    if(Array.isArray(a)){
                        all.splice(all.length,0,...a)
                    }else{
                        all.splice(all.length,0,a)
                    }
                    return all
                },[])
            return children.length==0 ? null : children
    }

    return createElement(data,"root")
}

const Node=({name,value, children})=>{
    if(!name)
        return null
    if(children){
        children=<div style={{marginLeft:10}}>{children}</div>
    }
    return (
        <Fragment>
            <div>{name}</div>
            {children}
        </Fragment>
    )

}

const FileSelector=connect(state=>state[KEY])(({dispatch,assemble,data, pilcrow, ...props})=>(
    <div>
        <center>
            <input {...props} type="file" accept=".json" onChange={({target})=>{
                let file=target.files[0]
                if(!file)
                    return
                let reader=new FileReader()
                reader.onload=e=>{
                    dispatch({type:`${KEY}/data`, payload:eval(`(a=>a)(${e.target.result})`)})
                }
                reader.readAsText(file)
                target.value=""
            }}/>
        </center>
        <div>
            <input type="checkbox" checked={assemble} onChange={a=>dispatch({type:`${KEY}/assemble`})}/>
            <span style={{background:!!data ? "lightgreen" : ""}}>Assemble</span>
        </div>
        <div>
            <Tree {...{data, node:<Node/>}}/>
        </div>
    </div>
))

const VariantEditor=connect(state=>state[KEY])(({data,assemble, pilcrow, ...props})=>{
    var editor=<Editor {...props}/>

    if(data && assemble){
        return (
            <Provider value={data}>
                {editor}
            </Provider>
        )
    }

    return editor
})

const Pilcrow=connect(state=>state[KEY])(({dispatch,pilcrow})=>(
    <Ribbon.CheckIconButton
        onClick={e=>dispatch({type:`${KEY}/pilcrow`})}
        status={pilcrow ? "checked" : "unchecked"}
        children={
            <SvgIcon>
                <g transform="translate(0 4)">
                    <path d="M9 10v5h2V4h2v11h2V4h2V2H9C6.79 2 5 3.79 5 6s1.79 4 4 4z"/>
                </g>
            </SvgIcon>
        }
        />
))

const DocxOffice=(
    <Workspace
        debug={true}
        accept="*"
        key={KEY}
        ruler={true}
        toolBar={
            <Ribbon.Ribbon commands={{
                home:{
                    more:(<ToolbarGroup><Pilcrow/></ToolbarGroup>)
                }
            }}>
                {"Draw,Design,References,Review,View,Developer".split(",").map(label=><Tab label={label} key={label}/>)}
                <Tab label="xPression">
                    <input type="checkbox"/>
                </Tab>
                <Tab label={<input placeholder="Tell me what you want to do"/>}/>
            </Ribbon.Ribbon>
        }
        reducer={(state={assemble:false, data:null, pilcrow:false},{type,payload})=>{
            switch(type){
                case `${KEY}/data`:
                    return {...state,  data:payload}
                case `${KEY}/assemble`:
                    return {...state, assemble:!state.assemble}
                case `${KEY}/pilcrow`:
                    return {...state, pilcrow:!state.pilcrow}
            }
            return state
        }}
        >
        <Workspace.Desk
            layout={
                <Workspace.Layout
                    right={
                        <div style={{width:210}}>
                            <Tabs>
                                <Tab label="Document">
                                    <DocumentTree toNodeProps={({id,type})=>({name:`${type}(${id})`})} />
                                </Tab>
                                <Tab label="Assemble">
                                    <FileSelector />
                                </Tab>
                            </Tabs>
                        </div>
                    }
                    />
            }>
            <VariantEditor {...{representation:"pagination", onContextMenu(){}, onKeyDown(){}}}/>
        </Workspace.Desk>
    </Workspace>
)

class MyDocx extends Docx{

}

exports.install=function(){
	Office.install(DocxOffice)
	MyDocx.install({
		type: "myDocx",
		template:"/templates/normal.docx"//when you create, you can choose this template to stare a new docx
	})
}

exports.uninstall=function(){
	Office.uninstall(DocxOffice)
	MyDocx.uninstall()
}
