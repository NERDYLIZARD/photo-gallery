/**
 * Created on 14-Jun-17.
 */
'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
  _id : { type: Schema.Types.ObjectId, required: true },
  caption: { type: String, default: '' },
  url: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  modifiedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Photo', schema);
