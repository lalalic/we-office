import React from "react"
import {Route, IndexRoute} from "react-router"


import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import Dashboard from "./dashboard"

export const App=({children, req, ...theme})=>{
    if(req && req.headers){
        theme.userAgent=req.headers['user-agent']||"all"
    }
    return (
        <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
            {children}
        </MuiThemeProvider> 
    )
}

export default (
    <Route path="/" component={Dashboard}>
        <IndexRoute component={()=><div>hello</div>}/>
        <Route path="docs" component={()=><div>docs</div>}/>
    </Route>
)