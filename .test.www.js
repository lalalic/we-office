import React from "react"
import render from "qili-app/www/client"
import routes, {App} from "./src/www/routes"
import {config} from "./package.json"

render(
    React.cloneElement(routes,{path:"/www/"}),
    document.querySelector('#root'),
    {
        service:config.service,
        appId:config.appId
    },
    App
)