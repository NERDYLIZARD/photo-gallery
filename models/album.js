/**
 * Created on 14-Jun-17.
 */
'use strict';
const fs = require('fs-extra');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Promise = require('bluebird');

const config = require('../project.config');

const schema = new Schema({
  _id : { type: Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  _photos: [{ type: Schema.Types.ObjectId, ref: 'Photo' }],
}, { timestamps: true });

schema.post('remove', (album, next) => {
  // remove all photo in _photo[]
  Promise.map(album._photos, photoId => {
    new Promise((resolve, reject) => {
      mongoose.model('Photo').findById(photoId, (error, photo) => {
        if (error) reject(error);
        // set to false so that photo model doesn't need to run unnecessary clean up
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
