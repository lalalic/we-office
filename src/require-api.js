const requires={
	"react":require("react"),
	"react-dom":require("react-dom"),
	"prop-types":require("prop-types"),
	"material-ui":require("material-ui"),
	"we-edit":require("we-edit"),
	"we-edit/office":require("we-edit/office"),
	"react-redux":require("react-redux"),
	"recompose":require("recompose")
}

module.exports=window.require=function(a){
	return requires[a]
}

module.exports.extend=function(name, m){
	if(m){
		requires[m]=name
	}else{
		delete requires[m]
	}
}