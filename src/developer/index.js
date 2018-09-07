import React from "react"

export default ()=>(
	<div>
		<p>
			There are some examples of plugins. Download it, and use bottom-right button to load it to play around.
		</p>
		<ol style={{marginLeft:30, lineHeight:"140%"}}>
			<li><a href="/example/plugins/loader-url.js" target="_plugin_viewer">Loader of URL</a></li>
			<li><a href="/example/plugins/stream-console.js" target="_plugin_viewer">Stream to console</a></li>
			<li><a href="/example/plugins/output-html.js" target="_plugin_viewer">Output to Html</a></li>
			<li><a href="/example/plugins/output-pdf.js" target="_plugin_viewer">Output to PDF</a></li>
			<li><a href="/example/plugins/plain-text-editor.js" target="_plugin_viewer">Text file (Representation,Input, Office)</a></li>
			<li><a href="/example/plugins/input-javascript.js" target="_plugin_viewer">javascript  file</a></li>
			<li><a href="/example/plugins/docx-office.js" target="_plugin_viewer">docx (Input, Office)</a></li>
		</ol>
	</div>
)