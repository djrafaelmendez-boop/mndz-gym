import React from 'react';
import ReactDOMServer from 'react-dom/server';
import App from './src/App.jsx';

setTimeout(() => {
   console.log("Starting render test");
   try {
     // we can't easily run it outside of vite environment because of imports
   } catch(e) {}
}, 100);
