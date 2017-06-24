/**
 * Created on 07-Jun-17.
 */
'use strict';
import _ from 'lodash';
import axios from 'axios';
import Gallery from 'react-photo-gallery';
import Lightbox from 'react-images';
import Measure from 'react-measure';
import Proptypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';
import { Row, Button } from 'react-bootstrap';

import '../../styles/album.scss';

class Album extends React.Component{
  constructor(){
    super();
    this.state = {currentImage:0, loadedAll: false, photos:null, pageNum:1, totalPages:1 };
    this.closeLightbox = this.closeLightbox.bind(this);
    this.gotoNext = this.gotoNext.bind(this);
    this.gotoPrevious = this.gotoPrevious.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.loadMorePhotos = this.loadMorePhotos.bind(this);
    this.openLightbox = this.openLightbox.bind(this);
    this.updateCaption = this.updateCaption.bind(this);
  }
  componentDidMount() {
    this.loadMorePhotos();
    this.loadMorePhotos = _.debounce(this.loadMorePhotos, 200);
    window.addEventListener('scroll', this.handleScroll);
  }
  closeLightbox(){
    this.setState({
      currentImage: 0,
      lightboxIsOpen: false,
    });
  }
  gotoPrevious(){
    this.setState({
      currentImage: this.state.currentImage - 1,
    });
  }
  gotoNext(){
    if(this.state.photos.length - 2 === this.state.currentImage){
      this.loadMorePhotos();
    }
    this.setState({
      currentImage: this.state.currentImage + 1,
    });
  }
  handleScroll(){
    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    if ((window.innerHeight + scrollY) >= (document.body.offsetHeight - 50)) {
      this.loadMorePhotos();
    }
  }
  loadMorePhotos(e) {
    if (e) {
      e.preventDefault();
    }
    if (this.state.pageNum > this.state.totalPages) {
      this.setState({loadedAll: true});
      return;
    }
    // API request
    axios.get(`/api/albums/${this.props.params.id}?perPage=5&pageNum=${this.state.pageNum}`)
      .then(response => {
        let photos = [];
        response.data.album._photos.forEach(photo => {
          photos.push({
            src: `/api${photo.url}?size=500`,
            width: parseInt(photo.width),
            height: parseInt(photo.height),
            caption: photo.caption,
            alt: photo._id,
            srcset: [
              // size = [1280, 1024, 800, 500, 240]
              `/api${photo.url}?size=240 240w`,
              `/api${photo.url}?size=500 500w`,
              `/api${photo.url}?size=800 800w`,
              `/api${photo.url}?size=1024 1024w`,
              `/api${photo.url}?size=1280 1280w`,
            ],
            sizes: [
              '(min-width: 480px) 50vw',
              '(min-width: 1024px) 33.3vw',
              '100vw'
            ]
          });
        });
        this.setState({
          photos: this.state.photos ? this.state.photos.concat(photos) : photos,
          pageNum: this.state.pageNum + 1,
          totalPages: response.data.album.pages
        });
      })
      .catch(err => console.error(err));
  }
  openLightbox(index, event){
    event.preventDefault();
    this.setState({
      currentImage: index,
      lightboxIsOpen: true
    });
  }
  updateCaption(caption) {
    console.log(caption);
  }
  renderGallery(){
    return(
      <Measure whitelist={['width']}>
        {
          ({ width }) => {
            let cols = 1;
            if (width >= 480){
              cols = 2;
            }
            if (width >= 1024){
              cols = 3;
            }
            if (width >= 1440){
              cols = 4;
            }
            return <Gallery photos={this.state.photos} cols={cols} onClickPhoto={this.openLightbox} />;
          }
        }
      </Measure>
    );
  }
  render(){
    // no loading sign if its all loaded
    if (this.state.photos){
      return(
        <div className="Album">
          <Row>
            <h1>Album</h1>
            <Link to={`/album-form/${this.props.params.id}`}>
              <Button bsStyle="primary">Add Photos</Button>
            </Link>
          </Row>
          {this.renderGallery()}
          <Lightbox
            backdropClosesModal={false}
            currentImage={this.state.currentImage}
            images={this.state.photos}
            isOpen={this.state.lightboxIsOpen}
            onClose={this.closeLightbox}
            onClickPrev={this.gotoPrevious}
            onClickNext={this.gotoNext}
            onUpdateCaption={this.updateCaption}
            theme={{container: { background: 'rgba(0, 0, 0, 0.85)' }}}
            width={1600}
          />
          {!this.state.loadedAll && <div className="loading-msg" id="msg-loading-more">Loading</div>}
        </div>
      );
    }
    else{
      return(
        <div className="Album">
          <div id="msg-app-loading" className="loading-msg">Loading</div>
        </div>
      );
    }
  }
}

Album.propTypes = {
  params: Proptypes.object.isRequired
};

export default Album;
