
export default class DocumentsPubSub{
	constructor(pubsub){
		this.pubsub=pubsub
		this.documents={}
	}

	asyncIterator(name){
		const asyncIterator=this.pubsub.asyncIterator(...arguments)
		const self=this
		let user
		Object.defineProperties(asyncIterator,{
			user:{
				set(v){
					const session=self.getDocumentSession(name)
					session.addWorker(user=v)
				},
				get(){
					return user
				}
			}
		});

		(_return=>{
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
		})(asyncIterator.return.bind(asyncIterator));

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
var uuid=10
class DocumentSession{
	constructor(name, pubsub){
		this.name=name
		this.id=(uuid++)*1000000
		this.uid=this.id+10000
		this.workers=[]
		this.pubsub=pubsub

		this.patchTimer=setInterval(()=>this.pullPatch(), 60*1000)
	}

	streamReady(){
		return !!this.data
	}

	getStream({app,user}){
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

	workerUid({_id}){
		return this.workers.find(a=>a._id==_id).uid
	}

	addWorker(worker){
		let found=this.workers.find(a=>a._id==worker._id)
		if(!found){
			this.workers.push(found={...worker,count:0})
			found.uid= this.workers.length==1 ? this.id : this.uid+=10000
		}
		found.count++
	}

	removeWorker(worker){
		const i=this.workers.findIndex(a=>a._id==worker._id)
		if(i==-1)
			return 
		const found=this.workers[i] 
		found.count--
		if(found.count<1){
			this.workers.splice(i,1)
		}
	}

	pullPatch(){
		if(!this.streamReady())
			return 
		const savers=this.workers.filter(({autoSave=true})=>autoSave)
		if(savers.length==0)
			return 

		const i=parseInt(Math.random()*10)%savers.length
		const chosen=savers[i]
		if(chosen){
			this.pubsub.publish(this.name, {target:chosen._id, action:{type:"we-edit/collaborative/save"}})
		}
	}

	applyPatch(patch, worker){
		return patch.forEach(({target,op,data})=>{
			if(data.type=='Buffer')
				data=Uint8Array.from(data.data)
			switch(target){
				case '*':
					this.data=data
				break
				default:
				break
			}
		})
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
		this.patchTimer && clearInterval(this.patchTimer)
	}
}

/**
 * doc workers[{_id,name,counter}]
 */