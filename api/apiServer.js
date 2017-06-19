/**
 * Created on 11-Jun-17.
 */
'use strict';
const async = require('async');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const chalkSuccess = require('chalk').green;
const express = require('express');
const fs = require('fs');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const sharp = require('sharp');
const sizeOf = require('image-size');

const app = express();
const albumsDirectory = path.join(__dirname, 'upload', 'albums');
mongoose.connect("localhost:27017/photo-gallery");
const Album = require('../models/album');
const Photo = require('../models/photo');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('test proxy');
});

app.get('/albums/:id', (req, res) => {
  Album.findById(req.params.id)
    .populate('_photos')
    .then(album => res.status(200).json({
      message: `successfully fetched album: ${album.name}`,
      album
    }))
    .catch(err => res.status(500).json({
      title: 'An error occurred',
      error: err
    }));
});

app.get('/albums/:id/:photoId', (req, res) => {

  const albumId = req.params.id;
  const photoId = req.params.photoId;
  const size = req.query.size;
 // size = [1280, 1024, 800, 500, 240]
  fs.readFile(`${albumsDirectory}/${albumId}/${photoId}/${size}.jpg`, (err, image) => {
    if (err)
      return res.status(500).json({
        title: 'An error occurred',
        error: err
    });
    res.send(image);
  });

});


const upload = multer();
app.post('/albums/create', upload.array('images'), (req, res) => {

  const _albumId = mongoose.Types.ObjectId();
  const albumDirectory = `${albumsDirectory}/${_albumId}`;

  // albums
  fs.mkdir(`${albumDirectory}`, (err) => {
    if (err) throw err;
    // create album model
    const album = new Album({
      _id: _albumId,
      name: _albumId.toString()
    });

    // each photo
    // parallel each photo then call back to save album
    async.each(req.files, (image, callback) => {
      const _photoId = mongoose.Types.ObjectId();
      const ext = image.mimetype.split('/').pop();
      const data = image.buffer;
      const photoDirectory = `${albumDirectory}/${_photoId}`;

      // each photo's directory
      fs.mkdir(`${photoDirectory}`, err => {
        if (err) throw err;
        fs.writeFile(`${photoDirectory}/original.${ext}`, data, err => {
          if (err) throw err;

          // get size
          sizeOf(`${photoDirectory}/original.${ext}`, (err, dimensions) => {
            if (err) throw err;
            const width = dimensions.width;
            const height = dimensions.height;

            // resize
            const resize = width => {
              return new Promise(() =>
                sharp(`${photoDirectory}/original.${ext}`)
                  .resize(+width)
                  .toFile(`${photoDirectory}/${width}.jpg`)
              );
            }
            Promise.all([
              resize('1280'),
              resize('1024'),
              resize('800'),
              resize('500'),
              resize('240'),
            ])
              .then(() => console.log('all done'))
              .catch(err => { throw error });

            const photo = new Photo({
              _id: _photoId,
              _album: _albumId,
              width,
              height,
              url: `/albums/${_albumId.toString()}/${_photoId.toString()}`,
            });
            photo.save((err, photo) => {
              if (err) throw err;
              album._photos.push(photo._id);
              callback();
            });
          });
        });
      });
    }, (err) => {
      if (err) throw err;
      album.save((err, album) => {
        if (err) throw err;
        res.status(201).json({
          message: `successfully created album ${album.name}`,
          album
        });
      });
    });

  });

});

const port = process.env.PORT || 3001;
app.listen(port, err => {
  if (err) return console.error(err);
  console.log(chalkSuccess(`\nAPI server listening on port: ${port}`));
});
