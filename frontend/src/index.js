import React from 'react';
import ReactDOM from 'react-dom/client';

// Import global styles for Ant Design.  The reset stylesheet is
// recommended in Ant Design v5 to avoid conflicts.
import 'antd/dist/reset.css';
// Uncomment the following lines if you need ProComponents or ProChat
// default styles.  These packages use CSS-in-JS by default, so
// explicit import is often unnecessary unless your build omits it.
// import '@ant-design/pro-components/dist/style.css';
// import '@ant-design/pro-chat/dist/index.css';

import App from './App';

// Create and render the root component.  The element with id "root"
// must exist in your public/index.html template.
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);