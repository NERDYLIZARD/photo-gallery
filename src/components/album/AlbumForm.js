/**
 * Created on 12-Jun-17.
 */
'use strict';
import React, {Component} from 'react';
import Proptypes from 'prop-types';
import Dropzone from 'react-dropzone';
import { Grid, Row, Col, Image, ButtonToolbar, Button } from 'react-bootstrap';

export default class AlbumForm extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      uploadedImages: []
    };
    this.dropImage = this.dropImage.bind(this);
    this.saveAlbum = this.saveAlbum.bind(this);
  }

  dropImage(images) {
    this.setState({
      uploadedImages: this.state.uploadedImages.concat(images)
    });
  }
  saveAlbum() {
    console.log(this.state.uploadedImages);
  }

  renderPreviews() {
    return (
      <Row>
        {this.state.uploadedImages.map(image =>
          <Col md={3} key={image.name}>
            <Image src={image.preview} responsive />
            <p>{image.name}</p>
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
            <Dropzone onDrop={this.dropImage}>
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
