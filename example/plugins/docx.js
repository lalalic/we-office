const React=require("react")
const {Viewer, Editor, Representation}=require("we-edit")
const {DefaultOffice, Workspace, Ribbon:{Ribbon}}=require("we-edit/office")
const IconRead=()=>"Read"
const IconPrint=()=>"Print"

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
				layout: "print",
				toolBar: React.createElement(Ribbon, { commands: { layout: true } })
			},
			React.createElement(Viewer, {
				toolBar: null,
				ruler: false,
				layout: "read",
				icon: React.createElement(IconRead, null),
				representation: React.createElement(Representation, { type: "pagination" })
			}),
			React.createElement(Editor, {
				layout: "print",
				icon: React.createElement(IconPrint, null),
				representation: React.createElement(Representation, { type: "pagination" })
			})
		)
	]
}

exports.install=function(){
	DefaultOffice.install(DocxOffice)
}

exports.uninstall=function(){
	DefaultOffice.uninstall(DocxOffice)
}


