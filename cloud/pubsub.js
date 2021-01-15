export default class DocumentsPubSub{
	constructor(pubsub){
		this.pubsub=pubsub
		this.documents={}
	}

	asyncIterator(name,{app,user}){
		const asyncIterator=this.pubsub.asyncIterator(...arguments);
		((_return, self)=>{
			asyncIterator.return=function(){
				const session=self.getDocumentSession(name)
				session.removeWorker(user)
				if(session.workers.length==0){
					session.save()
					session.close()
					delete self.documents[name]
				}
				return _return()
			}
		})(asyncIterator.return.bind(asyncIterator), this);

		this.getDocumentSession(name)
			.addWorker(user,app)
			.then(needSession=>{
				if(!needSession){
					this.documents[name].close()
					delete this.documents[name]
				}
			})
		return asyncIterator
	}

	publish(){
		this.pubsub.publish(...arguments)
	}

	getDocumentSession(name){
		if(!this.documents[name])
			this.documents[name]=new DocumentSession(name, this)
		return this.documents[name]
	}

	hasDocumentSession(name){
		return this.documents[name]
	}
}

/**
 * Each document has 1 session with unique id (id), so one worker can collaborative edit multiple document
 * each woker of a document should have unique id (uid), so there's no id conflict during editing
 * on editor side, id is document id, and uid is for content id generator
 */
var uuid=1, UID=1000000
class DocumentSession{
	constructor(name, pubsub){
		this.name=name
		this.uid=0
		this.workers=[]
		this.pubsub=pubsub
	}

	_streamReady(initMessage){
		if(this.data)
			return Promise.resolve({})
		
		if(this.streamingReady)
			return this.streamingReady
		
		const clear=()=>{
			this.initInterval && clearInterval(this.initInterval);
			this._resolveStreamingReady=a=>1
			delete this.streamingReady
		}

		clear()
		if(!initMessage){
			this._checkNeedSession()
		}
		return this.streamingReady=new Promise((resolve,reject)=>{
			this._resolveStreamingReady=(worker)=>(clear(), resolve(worker))
			let i=-1
			const fire=()=>{
				if(this.data){
					clear()
					return 
				}
				if(i>this.workers.length*2){
					clear()
					return reject(i)
				}
				const worker=this.workers[++i%this.workers.length]
				if(worker){
					Object.assign(initMessage.action.payload,{
						initiating:true,
						url:this.fileUrl,
						workers:this.workers.filter(a=>a._id!==worker._id)
					})
					this.pubsub.publish(this.name,{...initMessage, target:worker._id})
				}
			}
			this.initInterval=(fire(),setInterval(fire,1000*20))
		})
	}

	_checkNeedSession({app,user}){
		if(this.checkingNeed)
			return this.checkingNeed
		this.patchTimer && clearInterval(this.patchTimer)
		return this.checkingNeed=app.runQL(
			`query ($doc:String){
				me{
					document(id:$doc){
						shared
						checkouted
						checkoutByMe
						url
					}
				}
			}`,
			{doc:this.name},{},{app,user}
		).then(({data:{me:{document:{shared, checkouted, checkoutByMe, url}}}})=>{
			const needSession=!!(shared&&!checkouted)
			if(needSession){
				this.fileUrl=url
				this.id=uuid++
				this.patchTimer=setInterval(()=>this.pullPatch(), 60*1000)
			}
			return {needSession, url, checkoutByMe, checkouted,shared}
		})
	}

	getStream(){
		const {Readable}=require('stream')
		const self=this
		const stream=new Readable({
			read(){
				stream.push(self.data)
				stream.push(null)
			}
		})
		return stream
	}

	async addWorker(user, app){
		let found=this.workers.find(a=>a._id==user._id)
		if(!found){
			this.workers.push(found={_id:user._id, name:user.name||user.username,count:0})
			found.uid= this.uid+=UID
		}
		found.count++
		console.debug({action:"adding worker,then checking if session needed",...found})

		const {needSession,...document}=await this._checkNeedSession({app,user})
		console.debug({action:`session needed:${needSession}`,...found})

		const message={
			target:user._id, 
			action:{ 
				type:"we-edit/session-ready",	
				payload:{...document, needSession, uid: 1, id: 1}
			}
		}
		if(!needSession){//load remote static file with constant ids
			console.debug({action:`publishing since not needSession=${needSession}`,message})
			this.pubsub.publish(this.name, message)
			return false
		}

		//with session id and user id
		Object.assign(message.action.payload,{
			id:this.id, 
			uid: found.uid,
		})
		
		const streamInitedBy=await this._streamReady(message)
		if(streamInitedBy._id){
			console.debug({action:`stream inited by ${streamInitedBy.username}`,user})
		}
		if(streamInitedBy._id!==user._id){
			Object.assign(message.action.payload,{
				initiating:false,
				url:`/document/${this.name}`,
				workers:this.workers.filter(a=>a._id!==user._id)
			})
			process.nextTick(()=>{
				console.debug({action:`stream ready, ${user.username}, publishing`,message})
				this.pubsub.publish(this.name, message)
			})
		}
		return true
	}

	removeWorker(worker){
		const i=this.workers.findIndex(a=>a._id==worker._id)
		if(i==-1)
			return 
		//@TODO: worker.count
		this.workers.splice(i,1)
	}

	pullPatch(){
		const savers=this.workers.filter(({autoSave=true})=>autoSave)
		if(savers.length==0)
			return 

		const i=parseInt(Math.random()*10)%savers.length
		const chosen=savers[i]
		if(chosen){
			console.debug({action:`pulling patch`, chosen})
			this.pubsub.publish(this.name, {target:chosen._id, action:{type:"we-edit/collaborative/patch", payload:this.state}})
		}
	}

	applyPatch({status, patch, __patch__}, user){
		this.state=status			
		this._resolveStreamingReady(user)

		if(patch.length==1 && patch[0].target=='*'){
			this.data=patch[0].data
			return 
		}

		const patchFn=this[`${__patch__}Patch`]
		patchFn && patchFn.call(this,...arguments)
	}

	partPatch({status, patch},user){
		
	}

	setAutosave(autoSave,worker){
		let found=this.workers.find(a=>a._id==worker._id)
		if(found){
			found.autoSave=autoSave
		}
	}

	save(){

	}

	close(){
		console.debug({action:`close session=${this.name}`, })
		this.patchTimer && clearInterval(this.patchTimer)
		this.initInterval && clearInterval(this.initInterval)
	}
}

/**
 * doc workers[{_id,name,counter}]
 */