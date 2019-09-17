import ioFile from "we-edit/loader-stream-file"
import ioBrowser from "we-edit/loader-stream-browser"
import SVG from "we-edit/output-svg"

ioFile.install()
ioBrowser.install()
SVG.install()

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
	"we-edit/loader-stream-browser":require("we-edit/loader-stream-browser"),
	"we-edit/loader-stream-file":require("we-edit/loader-stream-file"),
	
}

export default window.require=function(a){
	return requires[a]||window.require.imported[a]
}
