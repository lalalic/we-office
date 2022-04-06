const cloud=require("./webpack.cloud")
const base=cloud()
module.exports=()=>({
        ...base,
        mode:"development",
        entry:[...base.entry,],
        output:{
            path:`${__dirname}/cloud`,
            filename:"debug__generated.js",
            devtoolNamespace:"we-office"
        },
        plugins:[
            new (require("webpack")).EvalSourceMapDevToolPlugin({
                exclude:/node_modules/,//(?!\/qili\-app)/,
                moduleFilenameTemplate: 'webpack:///we-office/[resource-path]?[loaders]'
            }),
            {
                apply: (compiler) => {
                    compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
                        let firstout=false
                        const spawn = require('child_process').spawn;
                        const child = spawn('yarn',['sync.dev', "--no-relay-compile", "--no-persist-query"], {cwd:process.cwd(),detached:true, timeout:1000*60});
                        child.stdout.on('data', function (data) {
                            if(!firstout){
                                console.log("Sync to local qili")
                                firstout=true
                            }
                            process.stdout.write(data);
                        });
                        child.stderr.on('data', function (data) {
                            if(!firstout){
                                console.log("Sync to local qili")
                                firstout=true
                            }
                            process.stderr.write(data);
                        });
                    });
                }
              }
        ]
    })