/**
 * Created on 11-Jun-17.
 */
'use strict';
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const chalkSuccess = require('chalk').green;
const express = require('express');
const fs = require('fs');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const uploadDirectory = path.join(__dirname, 'upload');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('test proxy');
});

const upload = multer();
app.post('/albums/create', upload.array('images'), (req, res) => {

  const _albumId = mongoose.Types.ObjectId();
  const albumDirectory = `${uploadDirectory}/${_albumId}`;
  fs.mkdirSync(`${albumDirectory}`);

  req.files.map(image => {
    const _photoId = mongoose.Types.ObjectId();
    const ext = image.mimetype.split('/').pop();
    const data = image.buffer;
    const photoDirectory = `${albumDirectory}/${_photoId}`;
    fs.mkdirSync(`${photoDirectory}`);
    fs.writeFileSync(`${photoDirectory}/original.${ext}`, data);
  });
});

const port = process.env.PORT || 3001;
app.listen(port, err => {
  if (err) return console.error(err);
  console.log(chalkSuccess(`\nAPI server listening on port: ${port}`));
});
