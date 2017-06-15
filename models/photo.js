/**
 * Created on 14-Jun-17.
 */
'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  _id : { type: Schema.Types.ObjectId, required: true },
  caption: { type: String, default: '' },
  url: { type: String, required: true },
  album: { type: Schema.Types.ObjectId, ref: 'Album' },
  createdAt: { type: Date, default: Date.now },
  modifiedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Photo', schema);
