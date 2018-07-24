/* global browser */
import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';

const root = document.querySelector('#app-frame');

const App = () => (
  <Fragment>
    <h1>Hello there</h1>
  </Fragment>
);

ReactDOM.render(<App />, root);
