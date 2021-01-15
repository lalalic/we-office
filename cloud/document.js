const {withFilter}=require("graphql-subscriptions")
const myDocuments=user=>({$or:[{author:user._id},{sharedTo:{$elemMatch:{$eq:user._id}}}]})
const getDocument=(...args)=>module.exports.User.document(...args)
const DOCUMENT={_id:true, author:true,sharedTo:true,checkoutBy:true}

module.exports={
    User:{
		async documents(_,{filter},{app,user}){
			const folder=`documents/${filter||""}/`.replace("//","/"),i=folder.length, j="documents/".length
			const files=await app.findEntity("File",{_id:{$regex:`^${folder}`}, ...myDocuments(user)}, DOCUMENT)
			return files.reduce((docs,{_id,...document})=>{
				const k=_id.indexOf("/",i)
				if(k!=-1){
					const id=_id.substring(j,k)
					if(docs.findIndex(a=>a.id==id && a.type=="folder")==-1){
						docs.push({id,type:"folder"})
					}
				}else{
					docs.push((document.id=_id.substring(j),document))
				}
				return docs
			},[])
		},
		document(_,{id,_id=`documents/${id}`},{app,user}){
			return app.get1Entity("File",{_id,...myDocuments(user)},DOCUMENT)
				.then(document=>(document.id=id,document))

		}
    },

	Document:{
		name({id}){
			return id.substring(id.lastIndexOf("/")+1)
		},
		type({id,type}){
			return type || id.substring(id.lastIndexOf(".")+1)
		},
		url({id,type}){
			return type=="folder" ? null : `documents/${id}`
		},
		shareBy({author},{},{app,user}){
			return author && author!=user._id ? app.getDataLoader("User").load(author) : null
		},
		checkoutBy({checkoutBy},{},{app}){
			return checkoutBy ? app.getDataLoader("User").load(checkoutBy) : null
		},
		isMine({author},{},{user}){
			return author==user._id
		},
		checkouted({checkoutBy}){
			return !!checkoutBy
		},
		checkoutByMe({checkoutBy},{},{user}){
			return checkoutBy==user._id
		},
		shared({sharedTo}){
			return sharedTo && sharedTo.length>0
		},
		workers({id},{},{app,user}){
			if(app.pubsub.hasDocumentSession(id)){
				return app.pubsub.getDocumentSession(id)
					.workers.map(a=>{
						if(user._id==a._id){
							return {...a, name:"Yourself"}
						}
						return a
					})
			}
			return []
		}
	},
	Subscription:{
		document_session:{
			subscribe:withFilter(
				(_,{doc},{app,user})=>app.pubsub.asyncIterator(doc,{app,user}),
				({target, worker},{},{user})=>{
					if(target){
						return user._id==target
					}else if(worker){
						return worker!=user._id
					}
					return true
				}
			),
			resolve({worker,action},{},{app}){
				return (worker ? app.getDataLoader("User").load(worker) : Promise.resolve(worker))
					.then(worker=>{
						return worker ? {action,worker} : {action}
					})
			}
		}
	},
    Mutation:{
		document_session(_,{doc,action},{app,user}){
			switch(action.type){
				case 'we-edit/collaborative/autosave':
					app.pubsub.getDocumentSession(doc).setAutosave(action.payload, user)
				break
				case 'we-edit/collaborative/save':
					app.pubsub.getDocumentSession(doc).applyPatch(action.payload, user)
				break
				default:
					app.pubsub.publish(doc,{worker:user._id,action})
				break
			}
			
			return true
		},
		checkout_document(_,{id,_id=`documents/${id}`},{app,user}){
			return app.patchEntity("File",{_id, ...myDocuments(user)},{checkoutBy:user._id})
				.then(()=>getDocument(...arguments))
		},

		checkin_document(_,{id,_id=`documents/${id}`},{app,user}){
			return app.patchEntity("File",{_id, ...myDocuments(user), checkoutBy:user._id},{checkoutBy:null})
				.then(()=>getDocument(...arguments))
		},

		share_document(_,{id,to:contact,_id=`documents/${id}`},{app,user}){
			return Promise.all([
				app.getUserByContact(contact),
				app.get1Entity("File",{_id,author:user._id})
			])
				.then(([to, file])=>{
					if(!(to && file))
						return
					let {sharedTo}=file
					sharedTo=sharedTo||[]
					if(!sharedTo.includes(to._id)){
						sharedTo.push(to._id)
						return app.patchEntity("File",{_id}, {sharedTo})
					}
				})
				.then(updated=>getDocument(...arguments))
		},

		unshare_document(_,{id,_id=`documents/${id}`, to:contact},{app,user}){
			if(contact){
				Promise.all([
					app.getUserByContact(contact),
					app.get1Entity("File",{_id,author:user._id})
				])
				.then(([to, file])=>{
					if(!(to && file))
						return 
					let {sharedTo}=file
					sharedTo=sharedTo||[]
					const i=sharedTo.indexOf(to._id)
					if(i!=-1){
						sharedTo.splice(i,1)
						return app.patchEntity("File",{_id}, {sharedTo})
					}
				})
				.then(updated=>getDocument(...arguments))
			}
			return app.patchEntity("File",{_id,author:user._id},{sharedTo:null})
				.then(updated=>getDocument(...arguments))
		},

		delete_document(_,{id,_id=`documents/${id}`},{app,user}){
			return app.remove1Entity("File",{_id,author:user._id})
		},

		save_document(_,{id,_id=`documents/${id}`},{app,user}){
			return app.get1Entity("File",{_id,...myDocuments(user)})
				.then(({checkoutBy})=>{
					if(!checkoutBy || checkoutBy==user._id){
						return app.runQL(`query token($_id:String){file_upload_token(key:$_id){token}}`,{_id},_,{app,user})
					}
					throw new Error(`checkouted by others`)
				})
				.then(({data:{file_upload_token:{token}}})=>({token,id:_id}))
		},
    }
}