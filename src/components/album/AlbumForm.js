/**
 * Created on 12-Jun-17.
 */
'use strict';
import React, {Component} from 'react';
import Proptypes from 'prop-types';
import Dropzone from 'react-dropzone';
import { Grid, Row, Col, Image, ButtonToolbar, Button, FormGroup, FormControl } from 'react-bootstrap';
import axios from 'axios';

export default class AlbumForm extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      uploadedImages: [],
      albumName: ''
    };
    this.dropImages = this.dropImages.bind(this);
    this.navigateAway = this.navigateAway.bind(this);
    this.removeImage = this.removeImage.bind(this);
    this.saveAlbum = this.saveAlbum.bind(this);
  }
  dropImages(images) {
    this.setState({
      uploadedImages: this.state.uploadedImages.concat(images)
    });
  }
  navigateAway() {
    const id = this.props.params.id;
    let redirectUrl = `/albums/${id}`;
    if (!id) {
      redirectUrl = '/albums';
    }
    this.props.router.push(redirectUrl);
  }
  removeImage(image) {
    this.setState({
      uploadedImages: this.state.uploadedImages.filter(uploadedImage =>
      uploadedImage.preview !== image.preview)
    });
  }
  saveAlbum() {
    if (!this.state.uploadedImages.length ||
        !this.state.albumName.length)
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
          <FormGroup>
            <FormControl
              autoFocus
              type="text"
              value={this.state.albumName}
              placeholder="Album Name"
              onChange={(e) => this.setState({albumName: e.target.value})}
            />
          </FormGroup>
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
            disabled={!this.state.uploadedImages.length}
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
