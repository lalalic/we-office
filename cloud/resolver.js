module.exports={
	User:{
		extensions(_,{},{app,user}){
			const loader=app.getDataLoader("Plugin")
			return Promise.all(
				(user.extensions||[])
					.map(({_id,version,config})=>
						loader
							.load(_id)
							.then(a=>{
								if(a){
									if(version && version!==a.version){
										a.code=a.code.replace(a.version,version)
									}
									a.version=version||a.version
									a.config=config||a.config
								}
								return a
							})
					)
			)
			.then(all=>all.filter(a=>!!a))
			.then(all=>{
				const i=a=>(a.type||[]).findIndex(t=>t=="Representation")
				return all.sort((a,b)=>i(b)-i(a))
			})
		},
		plugins(_,{},{app,user}){
			if(!user.isDeveloper)
				return []
			return app.findEntity("Plugin",{author:user._id})
		},
		plugin(_,{_id,name},{app,user}){
			let cond={}
			if(_id)
				cond._id=_id
			else if(name)
				cond.name=name
			else
				return null

			return app.get1Entity("Plugin",cond)
		},
		async documents(_,{filter},{app,user}){
			const folder=`documents/${filter||""}/`.replace("//","/"),i=folder.length, j="documents/".length
			const files=await app.findEntity("File",{_id:{$regex:`^${folder}`}, ...myDocuments(user)}, undefined, DOCUMENT)
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
	Mutation:{
		plugin_update(_,{_id, code, name, ...info},{app,user}){
			if(!user.isDeveloper){
				return Promise.reject("Please apply for as developer in your we-office account.")
			}

			return app
				.get1Entity("Plugin",{_id,author:user._id})
				.then(a=>{
					if(a){
						if(name && a.name!=name){
							return Promise.reject("name can't be changed in new version")
						}

						let _history=a.history||[]

						return app
							.patchEntity(
								"Plugin",
								{_id,author:user._id},
								{...info,
									code,
									history:[..._history,{version:a.version,config:a.config,createdAt:a.updatedAt||a.createdAt}]
								}
							)
							.then(()=>app.get1Entity("Plugin",{_id}))
					}else{
						return app.get1Entity("Plugin",{name})
							.then(b=>{
								if(b){
									return Promise.reject(`plugin[${name}] already exists.`)
								}else{
									return app.createEntity("Plugin",{...info,author:user._id,_id,code,name})
								}
							})

					}
				})
		},
		buy_plugin(_,{_id,version, config},{app,user}){
			let extensions=user.extensions||[]
			let i=extensions.findIndex(a=>a._id==_id)
			if(i==-1){
				extensions.push({_id,version,config})
			}else{
				extensions.splice(i,1,{_id,version,config})
			}
			return app.patchEntity("User", {_id:user._id}, {extensions})
				.then(()=>{
					user.extensions=extensions
					return user
				})
		},
		withdraw_plugin(_,{_id},{app,user}){
			let extensions=user.extensions||[]
			let i=extensions.findIndex(a=>a._id==_id)
			if(i==-1){
				return true
			}else{
				extensions.splice(i,1)
			}
			return app.patchEntity("User", {_id:user._id}, {extensions})
				.then(()=>{
					user.extensions=extensions
					return user
				})
		},
		user_setDeveloper(_,{be},{app,user}){
			return app.patchEntity("User",{_id:user._id},{isDeveloper:be})
				.then(()=>({_id:user._id, isDeveloper:be}))
		},
		document_session(_,{doc,action},{app,user}){
			app.pubsub.publish(doc,{worker:user._id,action})
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
		}
	},
	Anonymous:{
		plugins(_,{type,searchText,first,after},{app}){
			const query={first,after}
			if(type && type.length){
				query.type={$all:type}
			}
			if(searchText){
				query.description=new RegExp(`${searchText}.*`,"i")
			}
			return app.nextPage("Plugin", query)
		},
		plugins_count(){
			return 9
		},

		plugin(_,{_id,name},{app}){
			let cond={}
			if(_id)
				cond._id=_id
			else if(name)
				cond.name=name
			else
				return null

			return app.get1Entity("Plugin",cond)
		}
	},
	Query:{
		plugins(_,{type,searchText,mine,favorite,using,first,after},{app,user}){
			if(using){
				const loader=app.getDataLoader("Plugin")
				return Promise.all((user.extensions||[]).map(({_id})=>loader.load(_id)))
					.then(all=>all.filter(a=>!!a))
					.then(edges=>({edges,hasNextPage:false}))
			}
			const query={first,after}
			if(type && type.length){
				query.type={$all:type}
			}
			if(searchText){
				query.description=new RegExp(`${searchText}.*`,"i")
			}

			if(mine){
				query.author=user._id
			}
			if(favorite){

			}

			return app.nextPage("Plugin", query)
		},
		anonymous(){
			return {}
		}
	},
	Plugin:{
		id:Cloud.ID,
		author({author},_,{app,user}){
			return app.getDataLoader("User").load(author)
		},
		isMine({author},_,{user}){
			return user.isDeveloper && user._id==author
		},
		using({_id},{},{user:{extensions}}){
			let found=(extensions||[]).find(a=>a._id==_id)
			if(found){
				return {
					config:found.config,
					version:found.version
				}
			}
			return null
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
		workers({id,type},{},{app}){
			if(type=="folder")
				return []
			return app.pubsub.getDocumentSession(id).workers
		}
	},
	Subscription:{
		document_session:{
			async subscribe(_,{doc},{app,user}){//can't use withFilter since it doesn't support async 
				const pubsub=app.pubsub
				const {data:{me:{document:{checkouted,checkoutByMe,url:fileUrl}}}}=await app.runQL(
					`query ($doc:String){
						me{
							document(id:$doc){
								checkouted
								checkoutByMe
								url
							}
						}
					}`,
					{doc},_,{user}
				)
					
				setTimeout(()=>{
					pubsub.publish(doc,{
						target:user._id, 
						action:{
							type:"we-edit/session-ready", 
							payload:{
								checkouted, checkoutByMe, 
								url: checkouted ? fileUrl : `/document/${doc}`,
								id:	 checkouted ? 1 : pubsub.getDocumentSession(doc).id,
								workers:checkouted ? [] : pubsub.getDocumentSession(doc).workers.filter(a=>a._id!==user._id)
							}
						}
					})
				}, 100)

				if(!checkouted){//don't need session
					pubsub.getDocumentSession(doc).addWorker({_id:user._id, name:user.name||user.username})
					pubsub.publish(doc,{
						worker:user._id,
						action:{
							type:"we-edit/selection/SELECTED",
							payload:{
								_id:user._id,
								name:user.name||user.username,
								selection:{}
							}
						}
					})
				}
				return pubsub.asyncIterator(doc)
			},
			resolve({target, worker,action},{},{app,user}){
				if(!((!target || user._id==target) && worker!=user._id)){//filter
					return null
				}
				return (worker ? app.getDataLoader("User").load(worker) : Promise.resolve(worker))
					.then(worker=>{
						return Object.assign({action},{worker})
					})
			}
		}
	},
}

const myDocuments=user=>({$or:[{author:user._id},{sharedTo:{$elemMatch:{$eq:user._id}}}]})
const getDocument=(...args)=>module.exports.User.document(...args)
const DOCUMENT={_id:true, author:true,sharedTo:true,checkoutBy:true}
