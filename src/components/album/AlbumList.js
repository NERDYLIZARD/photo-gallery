/**
 * Created on 23-Jun-17.
 */
'use strict';
import _ from 'lodash';
import axios from 'axios';
import React, {Component} from 'react';
import { Link } from 'react-router';
import '../../styles/album-list.scss';

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
      this.setState({ loadedAll: true });
      return;
    }
    axios.get(`/api/albums?perPage=6&pageNum=${this.state.pageNum}`)
      .then(response => response.data.albumSet)
      .then(albumSet =>
        this.setState({
          albums: this.state.albums ? this.state.albums.concat(albumSet.albums) : albumSet.albums,
          pageNum: this.state.pageNum + 1,
          totalPages: albumSet.pages
        })
      )
      .catch(error => console.error(error));
  }
  handleScroll() {
    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    if ((window.innerHeight + scrollY) >= (document.body.offsetHeight - 50)) {
      this.loadMoreAlbums();
    }
  }
  renderAlbums() {
    return (
    <div className="row Album">
      {this.state.albums.map(album =>
      <div className="col-sm-6 col-md-4" key={album._id}>
        <Link to={`/albums/${album._id}`}>
          <div className="thumbnail">
            <img src={`/api${album._photos[0].url}?size=500`} alt={album.name}/>
              <div className="caption">
                <h3 className="text-center">{album.name}</h3>
              </div>
          </div>
        </Link>
      </div>)}
      {!this.state.loadedAll && <div className="loading-msg" id="msg-loading-more">Loading</div>}
    </div>);
  }
  render() {
    return (
      <div className="container">
        <h1 className="text-center">Albums</h1>
        <div className="row text-center">
          <Link to="/album-form">
            <button className="btn btn-primary">Add Album</button>
          </Link>
        </div>
        {
          !this.state.albums ?
          <div id="msg-app-loading" className="loading-msg">Loading</div> :
          this.renderAlbums()
        }
      </div>
    );
  }
}
