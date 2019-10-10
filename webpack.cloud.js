module.exports=()=>({
    entry:["@babel/polyfill","./cloud/index.js"],
    target:"node",
    externals: [
        function(context, request, callback){
            switch(request){
                case "react":
                case "react-dom/server":
                case "react-router":
                    return callback(null, 'commonjs '+request)
            }

            callback()
        }
    ],
    output:{
        path:`${__dirname}/cloud`,
        filename:"__generated.js",
    },
    mode:"production",
    //devtool:"inline-source-map",
    plugins:[
        //must not have devtool on options, and mode must be development
        new (require("webpack").SourceMapDevToolPlugin)({
            filename:'../dist/cloud.js.map',
            module:false,
            append: `\n//# sourceMappingURL=http://localhost:${require("./package.json").config.devPort}/cloud.js.map`
        })
    ],
    module: {
        rules: [
            {
                test: /.js?$/,
                use: ['source-map-loader'],
                enforce:"pre",
            },
          { test: /\.(js)$/, use: 'babel-loader' },
          {
            test:/.less?$/,
            use: [
                'css-loader',
                'less-loader',
            ]
        }
        ]
    },
    plugins:[],
    mode:"development",
})