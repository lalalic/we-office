import render from "qili-app/www/client"
import routes, {App} from "./routes"

render(
    routes,
    document.querySelector('#root'),
    {
        service:"https://api.wenshubu.com/1/graphql",
        appId:"5b07b8571f6cab002e832d23"
    },
    App
)