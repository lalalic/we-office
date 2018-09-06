const React=require("react")
const {Viewer, Editor, Representation}=require("we-edit")
const {Office, Workspace, Ribbon:{Ribbon,Tab}}=require("we-edit/office")
const InputDocx=require("input-docx")

const DocxOffice={
	workspaces:[
		React.createElement(
			Workspace,
			{
				accept(){
					console.dir(arguments)
					return true
				},
				key: "docx",
				layout: "print"
			},
			React.createElement(Editor, {
				toolBar: React.createElement(
						Ribbon, 
						{ commands: { layout: true } },
						..."Draw,Design,References,Review,View,Developer,xPression"
							.split(",")
							.map(label=>React.createElement(Tab,{label})),
						React.createElement(Tab,{label:React.createElement("input",{placeholder:"Tell me what you want to do"})}),
					),
				layout: "print",
				icon: null,
				representation: "pagination"
			})
		)
	]
}

class MyInputDocx extends InputDocx{
	
}

exports.install=function(){
	Office.install(DocxOffice)
	MyInputDocx.install({template:"/templates/normal.docx"})
}

exports.uninstall=function(){
	Office.uninstall(DocxOffice)
	MyInputDocx.uninstall()
}


