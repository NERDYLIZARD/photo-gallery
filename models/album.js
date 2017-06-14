/**
 * Created on 14-Jun-17.
 */
'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
  _id : { type: Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  _photos: [{
    type: Schema.Types.ObjectId, ref: 'Photo'
  }],
  createdAt: { type: Date, default: Date.now },
  modifiedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Album', schema);
