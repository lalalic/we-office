const cloud=require("./webpack.cloud")
module.exports=()=>({
    ...cloud(),
    plugins:[
        new (require("webpack")).EvalSourceMapDevToolPlugin({
            exclude:/node_modules(?!\/qili\-app)/,
            moduleFilenameTemplate: 'webpack://we-office/[resource-path]?[loaders]'
        })
    ]
})