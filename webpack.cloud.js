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
    module: {
        rules: [
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