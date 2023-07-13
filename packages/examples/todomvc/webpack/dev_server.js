var path = require('path');
var express = require('express');
var webpack = require('webpack');
var config = require('./webpack.dev');

var app = express();
var compiler = webpack(config);
var port = process.env.PORT || 1337;

app.use(require('webpack-dev-middleware')(compiler, {
  publicPath: config.output.publicPath
}));

app.use(require('webpack-hot-middleware')(compiler));

app.get('/node_modules/todomvc-app-css/index.css', (req, res) => {
  res.sendFile(path.join(
    __dirname, '../../../../node_modules/todomvc-app-css/index.css'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'static', 'index.html'));
});

app.listen(port, 'localhost', err => {
  if (err) {
    console.log(err);
    return;
  }

  console.log(`Listening at http://localhost:${port}`);
});
