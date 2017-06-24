/**
 * Created on 23-Jun-17.
 */
'use strict';
import _ from 'lodash';
import axios from 'axios';
import React, {Component} from 'react';
import { Link } from 'react-router';
import { Grid, Thumbnail, Row, Col, Button } from 'react-bootstrap';

export default class AlbumList extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = { loadedAll: false, albums: null, pageNum:1, totalPages:1 };
    this.handleScroll = this.handleScroll.bind(this);
    this.loadMoreAlbums = this.loadMoreAlbums.bind(this);
  }
  componentDidMount() {
    this.loadMoreAlbums();
    this.loadMoreAlbums = _.debounce(this.loadMoreAlbums, 200);
    window.addEventListener('scroll', this.handleScroll);
  }
  loadMoreAlbums(e) {
    if (e) {
      e.preventDefault();
    }
    if (this.state.pageNum > this.state.totalPages) {
      this.setState({loadedAll: true});
      return;
    }
    axios.get(`/api/albums?perPage=5&pageNum=${this.state.pageNum}`)
      .then(response => response.data.albumSet)
      .then(albumSet =>
        this.setState({
          albums: this.state.albums ? this.state.albums.concat(albumSet.albums) : albumSet.albums,
          pageNum: this.state.pageNum + 1,
          totalPages: albumSet.pages
        })
      )
      .catch(err => console.error(err));
  }
  handleScroll(){
    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    if ((window.innerHeight + scrollY) >= (document.body.offsetHeight - 50)) {
      this.loadMoreAlbums();
    }
  }
  renderAlbums() {
    return (
    <Row>
      {this.state.albums.map(album =>
        <Col xs={6} md={4} key={album._id}>
          <Link to={`/albums/${album._id}`}>
            <Thumbnail
              alt={album.name}
              src={`/api${album._photos[0].url}?size=500`}>
              <h3>{album.name}</h3>
            </Thumbnail>
          </Link>
        </Col>
      )}
    </Row>);
  }
  render() {
    return (
      <Grid>
        <Row>
          <h1>Albums</h1>
          <Link to="/album-form">
            <Button bsStyle="primary">Add Album</Button>
          </Link>
        </Row>
        {this.state.albums ?
          this.renderAlbums() :
          <div/>}
      </Grid>
    );
  }
}
