/**
it's to customize docx workspace, you would see the following change after this plugin loaded:
> when you create document, you  can see a template
> there are tabs of Draw,Design,References,Review,View,Developer,xPression when you open a docx
> there is input at end of tabs when you opena docx
**/
const React=require("react")
const {Viewer, Editor, Representation}=require("we-edit")
const {Office, Workspace, Ribbon:{Ribbon,Tab}}=require("we-edit/office")
const Docx=require("input-docx")
const {}=require("variant")


const KEY="docx"

const DocxOffice=React.createElement(Workspace,
	{
		accept(){
			return true
		},
		key: "docx",
		channel: "print",
		reducer(state={assemble:false},{type, payload}){
			switch(type){

			}
			return state
		}
	},
	React.createElement(Editor, {
		toolBar: React.createElement(
				Ribbon,
				{ commands: { channel: true } },
				..."Draw,Design,References,Review,View,Developer"
					.split(",")
					.map(label=>React.createElement(Tab,{label})),

				React.createElement(Tab,{label:"xPression"},
					React.createElement("input",{type:"checkbox"})
				),


				React.createElement(Tab,{label:React.createElement("input",{placeholder:"Tell me what you want to do"})}),
			),
		channel: "print",
		icon: null,
		representation: "pagination"
	})
)

class MyDocx extends Docx{

}

exports.install=function(){
	Office.install(DocxOffice)
	MyDocx.install({
		type: "myDocx",
		template:"/templates/normal.docx"//when you create, you can choose this template to stare a new docx
	})
}

exports.uninstall=function(){
	Office.uninstall(DocxOffice)
	MyDocx.uninstall()
}
