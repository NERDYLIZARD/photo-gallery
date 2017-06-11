/**
 * Created on 11-Jun-17.
 */
'use strict';
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const chalkSuccess = require('chalk').green;
const express = require('express');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('test proxy');
});

const port = process.env.PORT || 3001;
app.listen(port, err => {
  if (err) return console.error(err);
  console.log(chalkSuccess(`\nAPI server listening on port: ${port}`));
});
