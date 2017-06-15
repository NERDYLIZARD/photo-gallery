/**
 * Created on 14-Jun-17.
 */
'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  _id : { type: Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  _photos: [{
    type: Schema.Types.ObjectId, ref: 'Photo'
  }],
  createdAt: { type: Date, default: Date.now },
  modifiedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Album', schema);
