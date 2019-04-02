/**
it's to customize docx workspace, you would see the following change after this plugin loaded:
> when you create document, you  can see a template
> there are tabs of Draw,Design,References,Review,View,Developer,xPression when you open a docx
> there is input at end of tabs when you opena docx
**/
const React=require("react")
const {Viewer, Editor, Representation,DocumentTree}=require("we-edit")
const {Office, Workspace, Ribbon}=require("we-edit/office")
const {SvgIcon,ToolbarGroup,Tabs, Tab}=require("material-ui")
const {connect}=require("react-redux")
const minimatch=require("minimatch")

const Docx=require("input-docx")
debugger
const {Provider}=require("variant")
const {Fragment}=React

function _extends() {
  _extends =
    Object.assign ||
    function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
  return _extends.apply(this, arguments);
}

const KEY="docx"

const Tree=({data, filter="*", node})=>{
	filter=(filter=>{
		if(typeof(filter)=="string"){
			let glob=filter
			filter=key=>minimatch(`${key}`,glob)
		}

		if(typeof(filter)=="function")
			return filter

		return a=>!!filter
	})(filter);

	const toArray=a=>Object.keys(a).map(k=>[k,a[k]])
	const createElement=(value,key)=>{
		let children=typeof(value)=="object"&&value ? (Array.isArray(value) ? value.map((v,i)=>[i,v]) : toArray(value)) : null

		if(key=="root" || filter(key,value)){
			return React.cloneElement(
				node,
				{name:key, value, key},
				Array.isArray(children) ? create4Children(children) : children
			)
		}else{
			return Array.isArray(children) ? create4Children(children) : null
		}
	}

	const create4Children=children=>{
			children=children
				.map(([key,value])=>createElement(value,key))
				.filter(a=>!!a && (Array.isArray(a) ? a.length>0 : true))
				.reduce((all,a)=>{
					if(Array.isArray(a)){
						all.splice(all.length,0,...a)
					}else{
						all.splice(all.length,0,a)
					}
					return all
				},[])
			return children.length==0 ? null : children
	}

	return createElement(data,"root")
}

const Node = ({ name, value, children }) => {
  if (!name) return null;

  if (children) {
    children = React.createElement(
      "div",
      {
        style: {
          marginLeft: 10
        }
      },
      children
    );
  }

  return React.createElement(
    Fragment,
    null,
    React.createElement("div", null, name),
    children
  );
};


const FileSelector = connect(state => state[KEY])(
  ({ dispatch, assemble, data, pilcrow, ...props }) =>
    React.createElement(
      "div",
      null,
      React.createElement(
        "center",
        null,
        React.createElement(
          "input",
          _extends({}, props, {
            type: "file",
            accept: ".json",
            onChange: ({ target }) => {
              let file = target.files[0];
              if (!file) return;
              let reader = new FileReader();

              reader.onload = e => {
                dispatch({
                  type: `${KEY}/data`,
                  payload: eval(`(a=>a)(${e.target.result})`)
                });
              };

              reader.readAsText(file);
              target.value = "";
            }
          })
        )
      ),
      React.createElement(
        "div",
        null,
        React.createElement("input", {
          type: "checkbox",
          checked: assemble,
          onChange: a =>
            dispatch({
              type: `${KEY}/assemble`
            })
        }),
        React.createElement(
          "span",
          {
            style: {
              background: !!data ? "lightgreen" : ""
            }
          },
          "Assemble"
        )
      ),
      React.createElement(
        "div",
        null,
        React.createElement(Tree, {
          data,
          node: React.createElement(Node, null)
        })
      )
    )
);

const VariantEditor = connect(state => state[KEY])(
  ({ data, assemble, pilcrow, ...props }) => {
    var editor = React.createElement(Editor, props);

    if (data && assemble) {
      return React.createElement(
        Provider,
        {
          value: data
        },
        editor
      );
    }

    return editor;
  }
);

const Pilcrow = connect(state => state[KEY])(({ dispatch, pilcrow }) =>
  React.createElement(Ribbon.Components.CheckIconButton, {
    onClick: e =>
      dispatch({
        type: `${KEY}/pilcrow`
      }),
    status: pilcrow ? "checked" : "unchecked",
    children: React.createElement(
      SvgIcon,
      null,
      React.createElement(
        "g",
        {
          transform: "translate(0 4)"
        },
        React.createElement("path", {
          d: "M9 10v5h2V4h2v11h2V4h2V2H9C6.79 2 5 3.79 5 6s1.79 4 4 4z"
        })
      )
    )
  })
);


const DocxOffice=React.createElement(
  Workspace,
  {
    debug: true,
    accept: "*",
    key: KEY,
    ruler: true,
    toolBar: React.createElement(Ribbon.Ribbon, {
      commands: {
        layout: false,
        home: {
          more: React.createElement(
            ToolbarGroup,
            null,
            React.createElement(Pilcrow, null)
          )
        }
      }
  	},
		..."Draw,Design,References,Review,View,Developer"
			.split(",")
			.map(label=>React.createElement(Tab,{label})),

		React.createElement(Tab,{label:"xPression"},
			React.createElement("input",{type:"checkbox"})
		),
		React.createElement(Tab,{label:React.createElement("input",{placeholder:"Tell me what you want to do"})}),
	),
    reducer: function reducer() {
      var state =
        arguments.length > 0 && arguments[0] !== undefined
          ? arguments[0]
          : {
              assemble: false,
              data: null,
              pilcrow: false
            };

      var _ref = arguments.length > 1 ? arguments[1] : undefined,
        type = _ref.type,
        payload = _ref.payload;

      switch (type) {
        case "".concat(KEY, "/data"):
          return {
            ...state,
            data: payload
          };

        case "".concat(KEY, "/assemble"):
          return {
            ...state,
            assemble: !state.assemble
          };

        case "".concat(KEY, "/pilcrow"):
          return {
            ...state,
            pilcrow: !state.pilcrow
          };
      }

      return state;
    }
},
  React.createElement(Workspace.Desk, {
    layout: React.createElement(Workspace.Layout, {
      right: React.createElement(
        "div",
        {
          style: {
            width: 210
          }
        },
        React.createElement(
          Tabs,
          null,
          React.createElement(
            Tab,
            {
              label: "Document"
            },
            React.createElement(DocumentTree, {
              filter: function filter(_ref2) {
                var type = _ref2.type;
                return type != "styles";
              },
              toNodeProps: function toNodeProps(_ref3) {
                var id = _ref3.id,
                  type = _ref3.type,
                  props = _ref3.props;
                return {
                  name: "".concat(type, "(").concat(id, ")")
                };
              }
            })
          ),
          React.createElement(
            Tab,
            {
              label: "Assemble"
            },
            React.createElement(FileSelector, null)
          )
        )
      )
    }),
    children: React.createElement(VariantEditor, {
      representation: "pagination",
      onContextMenu: function onContextMenu(e) {
        return console.log("context menu");
      },
      onKeyDown: function onKeyDown(e) {
        return console.log("key down");
      }
    })
})

);

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
