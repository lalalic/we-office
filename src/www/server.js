import render from "qili-app/www/server"
import routes,{App} from "./routes"
import template from "./template"

export default render(routes, template, App)