const  path = require('path')

module.exports = {
    entry: './src/index.ts',
    mode: 'development',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'index.js'
    },
    resolve: {
      extensions: [ '.tsx', '.ts', '.js' ],
    },
    target: 'node',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
}
