/**
 * Created on 11-Jun-17.
 */
'use strict';
const Promise = require('bluebird');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const chalkSuccess = require('chalk').green;
const express = require('express');
const fs = require('fs-extra');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const sharp = require('sharp');
const sizeOf = require('image-size');

mongoose.connect("localhost:27017/photo-gallery");
mongoose.Promise = Promise;

const app = express();
const albumsDirectory = path.join(__dirname, 'upload', 'albums');

const Album = require('../models/album');
const Photo = require('../models/photo');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/albums', (req, res) => {
  const pageNum = Math.max(1, +req.query.pageNum);
  const perPage = Math.max(1, +req.query.perPage);
  Album.count((error, totalAlbums) => {
    if (error)
      return res.status(500).json({
        title: 'An error occurred',
        error
      });
    Album.find()
    // populate url for album cover,
      // will have album cover field in future
      .populate('_photos', 'url')
      .skip((pageNum - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: 'descending' })
      .exec((error, albums) => {
        if (error)
          return res.status(500).json({
            title: 'An error occurred',
            error
          });
        res.status(200).json({
          message: 'successfully fetch albums',
          albumSet: {
            albums,
            pages: Math.ceil(totalAlbums / perPage),
            totalAlbums,
            pageNum,
            perPage
          }
        });
      });
  });
});

app.get('/albums/:id', (req, res) => {
  Album.findById(req.params.id, (error, album) => {
    if (error)
      return res.status(500).json({
        title: 'An error occurred',
        error
      });
    // pagination
    const pageNum = Math.max(1, +req.query.pageNum);
    const perPage = Math.max(1, +req.query.perPage);

    Photo.find({ _album: req.params.id })
      .skip((pageNum-1) * perPage)
      .limit(perPage)
      .sort({ createdAt: 'descending' })
      .exec((error, photos) => {
        if (error)
          return res.status(500).json({
            title: 'An error occurred',
            error
          });
        res.status(200).json({
          message: `successfully fetched photos from album: ${album._doc.name}`,
          album:
            Object.assign({}, album._doc, {
              pages: Math.ceil(album._photos.length/perPage),
              totalPhotos: album._photos.length,
              _photos: photos,
              pageNum,
              perPage
            })
        });
      });
  });
});


app.get('/albums/:id/:photoId', (req, res) => {
  const albumId = req.params.id;
  const photoId = req.params.photoId;
  const size = req.query.size;
 // size = [1280, 1024, 800, 500, 240]
  fs.readFile(`${albumsDirectory}/${albumId}/${photoId}/${size}.jpg`, (error, image) => {
    if (error)
      return res.status(500).json({
        title: 'An error occurred',
        error
    });
    res.send(image);
  });
});


const upload = multer();
app.post('/albums/create', upload.array('images'), (req, res) => {
  const _albumId = mongoose.Types.ObjectId();
  const album = new Album({
    _id: _albumId,
    name: req.body.albumName
  });
  const albumDirectory = `${albumsDirectory}/${_albumId}`;
  // create album directory
  fs.ensureDir(albumDirectory)
    .then(() => createPhotos(req.files, album, albumDirectory))
    .then(() => album.save())
    .then(() => res.status(201).json({
      message: `successfully created album: ${album.name}`,
      album
    }))
    .catch(error => res.status(500).json({
      title: 'An error occurred',
      error
    }))
});

app.post('/albums/:id/add-photos', upload.array('images'), (req, res) => {
  Album.findById(req.params.id, (error, album) => {
    if (error)
      return res.status(500).json({
        title: 'An error occurred',
        error
      });
    const albumDirectory = `${albumsDirectory}/${req.params.id}`;
    createPhotos(req.files, album, albumDirectory)
      .then(() => album.save())
      .then(() => res.status(200).json({
        message: `successfully added photos to album: ${album.name}`,
        album
      }))
      .catch(error => res.status(500).json({
        title: 'An error occurred',
        error
      }));
  });
});

app.delete('/albums/:id', (req, res) => {
  Album.findById(req.params.id, (error, album) => {
    if (error)
      return res.status(500).json({
        title: 'An error occurred',
        error
      });
    album.remove()
      .then(album => res.status(200).json({
        message: `successfully removed album: ${album.name}`
      }))
      .catch(error => res.status(500).json({
        title: 'An error occurred',
        error
      }));
  });
});

app.delete('/albums/photos/:id', (req, res) => {
  Photo.findById(req.params.id, (error, photo) => {
    if (error)
      return res.status(500).json({
        title: 'An error occurred',
        error
      });
    photo.remove()
      .then(photo => res.status(200).json({
        message: `successfully removed photo: ${photo._id}`
      }))
      .catch(error => res.status(500).json({
        title: 'An error occurred',
        error
      }));
  });
});


function instantiatePhoto(_photoId, _albumId, originalWidth, originalHeight) {
  const photo = new Photo({
    _id: _photoId,
    _album: _albumId,
    width: originalWidth,
    height: originalHeight,
    url: `/albums/${_albumId.toString()}/${_photoId.toString()}`,
  });
  return photo.save();
}

function resize(photoDirectory, originalWidth, originalHeight, ext) {
  const width = ['1280', '1024', '800', '500', '240'];
  return Promise.map(width, width =>
    new Promise((resolve, reject) =>
      sharp(`${photoDirectory}/original.${ext}`)
        .resize(width >= originalWidth ?  originalWidth : +width)
        .toFile(`${photoDirectory}/${width}.jpg`)
        .then(() => resolve())
        .catch(error => reject(error))
    )
  )
  .then(() => {
    // clear cache after finish image processing. Otherwise,
      // immediate modification of file e.g delete is not possible.
    sharp.cache(false);
    // pass original size to Photo
    return Promise.resolve({originalWidth, originalHeight})
  })
  .catch(error => Promise.reject(error));
}

function createPhotos(images, album, albumDirectory) {
  return Promise.map(images, image => {
    const _photoId = mongoose.Types.ObjectId();
    const ext = image.mimetype.split('/').pop();
    const data = image.buffer;
    const photoDirectory = `${albumDirectory}/${_photoId}`;

    // create photo directories
    return new Promise((resolve, reject) => {
      fs.ensureDir(photoDirectory)
        .then(() => fs.outputFile(`${photoDirectory}/original.${ext}`, data))
        .then(() => sizeOf(`${photoDirectory}/original.${ext}`))
        .then(({ width: originalWidth, height: originalHeight }) =>
          resize(photoDirectory, originalWidth, originalHeight, ext))
        .then(({ originalWidth, originalHeight }) =>
          instantiatePhoto(_photoId, album._id, originalWidth, originalHeight))
        .then(photo => album._photos.push(photo._id))
        .then(() => resolve())
        .catch(error => reject(error));
    });
  })
    .then(() => Promise.resolve())
    .catch(error => Promise.reject(error));
}


const port = process.env.PORT || 3001;
app.listen(port, error => {
  if (error) return console.error(error);
  console.log(chalkSuccess(`\nAPI server listening on port: ${port}`));
});
