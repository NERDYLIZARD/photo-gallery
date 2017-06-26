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
import { Grid, Row, Col, Image, ButtonToolbar, Button } from 'react-bootstrap';

export default class AlbumForm extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      uploadedImages: [],
      albumName: '',
      errors: {}
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
    axios.post(postUrl, formData)
      .then(() => this.props.router.push(redirectUrl));
  }
  renderPreviews() {
    return (
      <Row>
        {this.state.uploadedImages.map(image =>
          <Col md={3} key={image.name}>
            <div>
              <Image src={image.preview} responsive onClick={() => this.removeImage(image)}/>
              <p>{image.name}</p>
            </div>
          </Col>
        )}
      </Row>
    );
  }
  render() {
    return (
      <Grid>
        {this.props.params.id ?
          <h1>Add Photos</h1> :
          <h1>New Album</h1>
        }
        {this.props.params.id ?
          <div/> :
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
        <Row className="show-grid">
          <Col md={12}>
            <Dropzone onDrop={this.dropImages}>
              <p>drag & drop</p>
            </Dropzone>
          </Col>
        </Row>
        {this.state.uploadedImages.length ?
          this.renderPreviews() :
          <div/>
        }
        <ButtonToolbar>
          <Button
            bsStyle="primary"
            onClick={this.saveAlbum}
          >Save</Button>
          <Button
            onClick={this.navigateAway}
          >Cancel</Button>
        </ButtonToolbar>
      </Grid>
    );
  }
}

AlbumForm.propTypes = {
  params: Proptypes.object.isRequired,
  router: Proptypes.object.isRequired
};
