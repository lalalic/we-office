
module.exports=()=>({
    entry:["@babel/polyfill","./cloud/index.js"],
    target:"node",
    externals: [
        function(context, request, callback){
            if(request.startsWith("./docs")){
                return callback(null, "commonjs "+request)
            }

            switch(request){
                case "react":
                case "react-dom/server":
                case "react-router":
                case "graphql-subscriptions":
                case "fs":
                    return callback(null, 'commonjs '+request)
            }

            callback()
        }
    ],
    output:{
        path:`${__dirname}/cloud`,
        filename:"__generated.js",
        devtoolNamespace:"we-office"
    },
    mode:"production",
    module: {
        rules: [{
            test: /\.js$/,
            use: 'source-map-loader',
            enforce:"pre",
            include: /qili\-app/
        },
        { 
            test: /\.(js)$/, 
            use: "babel-loader",
            exclude: /node_modules/, 
        },{
            test:/\.less?$/,
            use: [
                'css-loader',
                'less-loader',
            ]
        }]
    },
})