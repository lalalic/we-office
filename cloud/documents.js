
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
			this.documents[name]=new DocumentSession(name)
		return this.documents[name]
	}

	hasDocumentSession(name){
		return this.documents[name]
	}
}

var uuid=10
class DocumentSession{
	constructor(name){
		this.name=name
		this.id=(uuid++)*1000000
		this.workers=[]
	}

	getStream({app,user}){
		return app.runQL(
			`query ($doc:String){
				me{
					document(id:$doc){
						url
					}
				}
			}`,
			{doc:this.name},{},{app,user}
		).then(({data:{me:{document:{url}}}})=>{
			return fetch(encodeURI(url)).then(res=>res.body)
		})
	}


	addWorker(worker){
		let found=this.workers.find(a=>a._id==worker._id)
		if(!found){
			this.workers.push(found={...worker,count:0})
		}
		found.count++
	}

	removeWorker(worker){
		const i=this.workers.findIndex(a=>a._id==worker._id)
		const found=this.workers[i] 
		found.count--
		if(found.count<1){
			this.workers.splice(i,1)
		}
	}
}

/**
 * doc workers[{_id,name,counter}]
 */