/**
 * Created on 12-Jun-17.
 */
'use strict';
import _ from 'lodash';
import axios from 'axios';
import Dropzone from 'react-dropzone';
import Proptypes from 'prop-types';
import React, {Component} from 'react';

import TextInput from '../common/TextInput';

export default class AlbumForm extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      albumName: '',
      errors: {},
      saving: false,
      uploadedImages: []
    };
    this.dropImages = this.dropImages.bind(this);
    this.formIsValid = this.formIsValid.bind(this);
    this.navigateAway = this.navigateAway.bind(this);
    this.removeImage = this.removeImage.bind(this);
    this.saveAlbum = this.saveAlbum.bind(this);
  }
  componentWillUnmount() {
    this.state.uploadedImages.forEach(image =>
      window.URL.revokeObjectURL(image.preview));
  }
  dropImages(images) {
    this.setState({
      uploadedImages: this.state.uploadedImages.concat(images)
    });
  }
  formIsValid() {
    const errors = {};
    if (!this.state.albumName.length) {
      errors.albumName = [];
      errors.albumName.push('Album name is required');
    }
    if (!this.state.uploadedImages.length) {
      errors.uploadedImages = [];
      errors.uploadedImages.push('Image is required');
    }
    this.setState({ errors });
    return _.isEmpty(errors);
  }
  navigateAway() {
    const id = this.props.params.id;
    let redirectUrl = `/albums/${id}`;
    if (!id)
      redirectUrl = '/albums';
    this.props.router.push(redirectUrl);
  }
  removeImage(image) {
    this.setState({
      uploadedImages: this.state.uploadedImages.filter(uploadedImage =>
      uploadedImage.preview !== image.preview)
    });
  }
  saveAlbum() {
    if (!this.formIsValid())
      return;

    // formData() for multipart data
    const formData = new FormData();
    this.state.uploadedImages.map(image =>
      formData.append('images', image)
    );
    // add new photos to existing album
    const id = this.props.params.id;
    let postUrl = `/api/albums/${id}/add-photos`;
    let redirectUrl = `/albums/${id}`;

    // create new album
    if (!id) {
      formData.append('albumName', this.state.albumName);
      postUrl = '/api/albums/create';
      redirectUrl = '/albums';
    }
    this.setState({ saving: true });
    axios.post(postUrl, formData)
      .then(() => {
        this.setState({ saving: false });
        this.props.router.push(redirectUrl);
      })
      .catch(error => this.setState({ saving: false }));
  }
  renderPreviews() {
    return (
      <div className="row">
        {this.state.uploadedImages.map(image =>
          <div className="col-sm-6 col-md-4" key={image.preview}>
            <div>
              <img
                className="img-responsive"
                onClick={() => this.removeImage(image)}
                src={image.preview}/>
              <p>{image.name}</p>
            </div>
          </div>
        )}
      </div>
    );
  }
  render() {
    return (
      <div className="container">
        <h1 className="text-center">{this.props.params.id ? "Add Photos" : "New Album"}</h1>
        {this.props.params.id ?
          null :
          <TextInput
            autoFocus={true}
            errors={this.state.errors.albumName}
            name="album-name"
            onChange={(e) => this.setState({ albumName: e.target.value })}
            placeholder="Enter Album Name"
            type="text"
            value={this.state.albumName}
          />
        }
        <div className="row">
          <Dropzone onDrop={this.dropImages}>
            <p>drag & drop</p>
          </Dropzone>
        </div>
        {this.state.uploadedImages.length ?
          this.renderPreviews() :
          <div/>
        }
        <div>
          <button
            className="btn btn-primary"
            disabled={this.state.saving}
            onClick={this.saveAlbum}>
            {this.state.saving ? 'Saving' : 'Save'}
          </button>
          <button
            className="btn btn-default"
            onClick={this.navigateAway}>
            Cancel
          </button>
        </div>
      </div>
    );
  }
}

AlbumForm.propTypes = {
  params: Proptypes.object.isRequired,
  router: Proptypes.object.isRequired
};
