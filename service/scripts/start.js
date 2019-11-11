const webpack = require('webpack')
const config = require('../webpack.config')
const compiler = webpack(config)
const chalk = require('chalk')
compiler.run( (...args) => {
    console.log(chalk.green(...args))
    require('../dist/index.js')
})