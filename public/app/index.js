import React from 'react';
import { render } from 'react-dom';

function HelloPepl() {
  return (
    <div>
      <h1>Hello PEPL!</h1>
      <img alt="pepl logo" src="static/images/epl.png" />
    </div>
  );
}

render(<HelloPepl />, document.getElementById('pepl'));
