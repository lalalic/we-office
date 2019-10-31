import ioFile from "we-edit/loader-stream-file"
import ioBrowser from "we-edit/loader-stream-browser"

ioFile.install()
ioBrowser.install()

const requires={
	"react":require("react"),
	"react-dom":require("react-dom"),
	"prop-types":require("prop-types"),
	"material-ui":require("material-ui"),
	"react-redux":require("react-redux"),
	"recompose":require("recompose"),
	"minimatch":require("minimatch"),
	"we-edit":require("we-edit"),
	"we-edit/office":require("we-edit/office"),
	"we-edit/representation-pagination":require("we-edit/representation-pagination"),
	"we-edit/representation-html": require("we-edit/representation-html"),
	"we-edit/representation-text":require("we-edit/representation-text"),
	"we-edit/representation-plain":require("we-edit/representation-plain"),
	"we-edit/loader-stream-browser":require("we-edit/loader-stream-browser"),
	"we-edit/loader-stream-file":require("we-edit/loader-stream-file"),
	"we-edit/input-docx":require("we-edit/input-docx"),
	"we-edit/input-json":require("we-edit/input-json"),
	"stream":require("readable-stream"),
	"readable-stream":require("readable-stream"),
	"docx4js":require("docx4js"),
	"lodash":require("lodash"),
}

export default window.require=function(a){
	const required=requires[a]||window.require.imported[a]
	if(!required){
		throw new Error(`are you depend on plugin ${a}, but you don't buy it?`)
	}
	return required
}
