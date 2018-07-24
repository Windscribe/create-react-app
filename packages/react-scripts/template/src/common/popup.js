import React from 'react';
import { render } from 'react-dom';

const root = document.querySelector('#app-frame');

const App = () => (
  <>
    <h1>
      Extension ready! Start writing code!
      <span role="img" aria-label="tada">
        🎉
      </span>
    </h1>
  </>
);

render(<App />, root);
