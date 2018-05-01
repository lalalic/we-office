(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
Cloud.typeDefs=``

Cloud.resolver={}

Cloud.persistedQuery=require("./persisted-query")

module.exports=Cloud

},{"./persisted-query":2}],2:[function(require,module,exports){
//generated from persisted-query.js, don't edit it
module.exports={
	"weOffice_prefetch_Query":`query weOffice_prefetch_Query {
		  me {
		    id
		    token
		  }
		}
		`
}
},{}]},{},[1]);
