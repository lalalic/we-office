import React from "react"
import {version as WE} from "we-edit/package.json"
import {version as Qili2} from "qili-app/package.json"
import {version as Office} from "../../package.json"


export default ({style={}})=>(
	<div style={style}>
		<center>qili2:{Qili2}, we-edit:{WE}, we-office:{Office}</center>
		<p>
			wenshubu is based on <a href="https://app.qili2.com">qili2</a>, a cloud platform, and <a href="https://github.com/lalalic/we-edit">we-edit</a>, a document editing library. 
		</p>
		<p>
			There are some examples of plugins. Download it, and use bottom-right button to load it to play around.
		</p>
		<ol style={{marginLeft:30, lineHeight:"140%"}}>
			<li><a href="/example/plugins/loader-url.js" target="_plugin_viewer">Loader of URL</a></li>
			<li><a href="/example/plugins/stream-console.js" target="_plugin_viewer">Stream to console</a></li>
			<li><a href="/example/plugins/output-pdf.js" target="_plugin_viewer">Output to PDF</a></li>
			<li><a href="/example/plugins/input-javascript.js" target="_plugin_viewer">javascript  file</a></li>
			<li><a href="/example/plugins/docx-office.js" target="_plugin_viewer">docx (Input, Office)</a></li>
		</ol>
		<p>
			Most importantly for big plugin with bundle tools, such as webpack, the following libraries should be externals: 
			<strong>react,react-dom,material-ui,prop-types,we-edit,react-redux,recompose,stream, readable-stream</strong>.
		</p>
		<p>
			Installed plugins can be required too in your plugin code, such as require("input-docx").
		</p>
	</div>
)
