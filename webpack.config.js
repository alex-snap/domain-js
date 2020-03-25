// const path = require('path');

// module.exports = {
//     mode: 'production',
//     entry: './src/index.js',
//     output: {
//         path: path.resolve('dist'),
//         filename: 'index.js',
//         libraryTarget: 'commonjs2',
//     },
//     module: {
//         rules: [{
//             test: /\.js?$/,
//             exclude: /(node_modules)/,
//             use: 'babel-loader',
//         }, ],
//     },
//     resolve: {
//         extensions: ['.js'],
//     },
// };

const path = require('path');

module.exports = {
    mode: 'production',
    entry: './src/index.ts',
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
        }, ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'commonjs2',
    },
};