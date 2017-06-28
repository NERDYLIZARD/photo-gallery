/**
 * Created on 14-Jun-17.
 */
'use strict';
const fs = require('fs-extra');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const config = require('../project.config');
const Album = require('./album');

const schema = new Schema({
  _id : { type: Schema.Types.ObjectId, required: true },
  caption: { type: String, default: '' },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  url: { type: String, required: true },
  _album: { type: Schema.Types.ObjectId, ref: 'Album' },
  removeHookEnabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  modifiedAt: { type: Date, default: Date.now }
});

// hook guard: whether hook should be called
schema.post('remove', (photo, next) => {
  if (photo.removeHookEnabled) next();
});

// pull the being deleted photo out of ablum.photos[]
schema.post('remove', (photo, next) => {
  Album.findById(photo._album, (error, album) => {
    if (error) next(error);
    album._photos.pull(photo._id);
    album.save()
      .then(() => next())
      .catch(error => next(error));
  });
});

// remove photo directory from static file
schema.post('remove', (photo, next) => {
  const photoDirectory = `${config.basePath}/api/upload/albums/${photo._album}/${photo._id}`;
  fs.remove(photoDirectory)
    .then(() => next())
    .catch(error => next(error));
});

module.exports = mongoose.model('Photo', schema);
