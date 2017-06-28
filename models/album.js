/**
 * Created on 14-Jun-17.
 */
'use strict';
const fs = require('fs-extra');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Promise = require('bluebird');

const config = require('../project.config');
const Photo = require('./photo');

const schema = new Schema({
  _id : { type: Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  _photos: [{ type: Schema.Types.ObjectId, ref: 'Photo' }],
  createdAt: { type: Date, default: Date.now },
  modifiedAt: { type: Date, default: Date.now }
});

schema.post('remove', (album, next) => {
  Promise.map(album._photos, photoId => {
    new Promise((resolve, reject) => {
      Photo.findById(photoId, (error, photo) => {
        if (error) reject(error);
        photo.removeHookEnabled = false;
        photo.remove()
          .then(() => resolve())
          .catch(error => reject(error));
      });
    });
  })
    .then(() => next())
    .catch(error => next(error));
});

schema.post('remove', (album, next) => {
  const albumDirectory = `${config.basePath}/api/upload/albums/${album._id}`;
  fs.remove(albumDirectory)
    .then(() => next())
    .catch(error => next(error));
});

module.exports = mongoose.model('Album', schema);
