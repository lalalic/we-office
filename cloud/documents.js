
export default class DocumentsPubSub{
	constructor(pubsub){
		this.pubsub=pubsub
		this.documents={}
	}

	subscribe(name){
		if(name=="ping"){
			return this.pubsub.subscribe(...arguments)	
		}
		return this.pubsub.subscribe(...arguments)
	}

	unsubscribe(){
		debugger
		this.pubsub.unsubscribe(...arguments)
	}

	asyncIterator(){
		return this.pubsub.asyncIterator(...arguments)
	}

	publish(name, action){
		if(name!="ping"){
			if(action.type=="we-edit/selection/selected"){
				this.documents[name].selected(action.worker, action.payload)
			}
		}
		this.pubsub.publish(...arguments)
	}

	getDocumentSession(name){
		if(!this.documents[name])
			this.documents[name]=new DocumentSession(name)
		return this.documents[name]
	}

	unloadDocument(){
		delete this.documents[name]
	}
}

var uuid=10
class DocumentSession{
	constructor(name){
		this.path=`/Users/lir/Workspace/qili/docs/${name}`
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
			return fetch(url).then(res=>res.body)
		})
	}


	addWorker(worker){
		if(!this.workers.find(a=>a._id==worker._id)){
			this.workers.push(worker)
		}
	}

	selected(worker, selection){
		this.workers.find(a=>a._id==worker).selection=selection
	}
}