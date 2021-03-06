import React from 'react';
import { Route, IndexRoute } from 'react-router';

import App from './components/App';
import HomePage from './components/HomePage';
import Album from './components/album/Album';
import AlbumList from './components/album/AlbumList';
import AlbumForm from './components/album/AlbumForm';
import AboutPage from './components/AboutPage';
import NotFoundPage from './components/NotFoundPage';

export default (
  <Route path="/" component={App}>
    <IndexRoute component={HomePage}/>
    <Route path="albums" component={AlbumList}/>
    <Route path="albums/:id" component={Album}/>
    <Route path="album-form" component={AlbumForm}/>
    <Route path="album-form/:id" component={AlbumForm}/>
    <Route path="about" component={AboutPage}/>
    <Route path="*" component={NotFoundPage}/>
  </Route>
);
