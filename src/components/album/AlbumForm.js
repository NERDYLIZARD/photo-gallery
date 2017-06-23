/**
 * Created on 12-Jun-17.
 */
'use strict';
import React, {Component} from 'react';
import Proptypes from 'prop-types';
import Dropzone from 'react-dropzone';
import { Grid, Row, Col, Image, ButtonToolbar, Button } from 'react-bootstrap';
import axios from 'axios';

export default class AlbumForm extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      uploadedImages: []
    };
    this.dropImages = this.dropImages.bind(this);
    this.removeImage = this.removeImage.bind(this);
    this.saveAlbum = this.saveAlbum.bind(this);
  }
  dropImages(images) {
    this.setState({
      uploadedImages: this.state.uploadedImages.concat(images)
    });
  }
  removeImage(image) {
    this.setState({
      uploadedImages: this.state.uploadedImages.filter(uploadedImage =>
      uploadedImage.preview !== image.preview)
    });
  }
  saveAlbum() {
    // formData() for multipart data
    const formData = new FormData();
    formData.append('name', 'abc');
    this.state.uploadedImages.map(image =>
      formData.append('images', image)
    );
    axios.post('/api/albums/create', formData);
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
        <h1>Album Form</h1>
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
          <Button>Cancel</Button>
        </ButtonToolbar>
      </Grid>
    );
  }
}

AlbumForm.propTypes = {
  // myProp: PropTypes.string.isRequired
};
