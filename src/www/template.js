import Helmet from "react-helmet"

export default function({content, data}){
    var helmet=Helmet.renderStatic()

    return `<!doctype html><html ${helmet.htmlAttributes.toString()}>
        <head>
            <meta charset="utf-8" />
            <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">
            ${helmet.title.toString()}
            ${helmet.meta.toString()}
            ${helmet.link.toString()}
            <style>
                @media screen and (min-width:960px){
                    section{
                        width:960px;
                        margin:auto;
                    }
                }
                footer a, header a{
                    color:white;
                    font-weight:700;
                    padding: 10px;
                    text-decoration:none;
                }
                ${require("qili-app/index.less")}
                ${require("../index.less")}
            </style>
        </head>
        <body style="margin:0;background:white;" ${helmet.bodyAttributes.toString()}><div id="root">${content}</div></body>
        <script>
            window.__RELAY_BOOTSTRAP_DATA__ = ${JSON.stringify(data)};
        </script>
        <script src="/index.js" defer></script>
    </html>`
}