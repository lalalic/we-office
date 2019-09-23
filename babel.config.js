module.exports={
    "presets": [
      ["@babel/preset-env"],
      "@babel/preset-react",
    ],
    "plugins": [
        "babel-plugin-relay",
        ["@babel/plugin-transform-runtime",{}],
        ["@babel/plugin-transform-spread",{loose:true}],
        "@babel/plugin-proposal-object-rest-spread",
        "@babel/plugin-proposal-class-properties",
        "@babel/plugin-syntax-dynamic-import",
    ]
} 