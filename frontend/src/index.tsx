/**
 * =============================================================================
 * INDEX.TSX - Application Entry Point
 * =============================================================================
 * The main entry point for the React application.
 * 
 * This file:
 * - Imports global styles
 * - Renders the App component into the DOM
 * - Sets up React StrictMode for development warnings
 * =============================================================================
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Import global styles
import "./styles/global.css";
import "./styles/Layout.css";

/**
 * Get the root element from the DOM.
 * This element is defined in public/index.html.
 */
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error(
    "Failed to find the root element. Make sure there is a <div id='root'></div> in your index.html."
  );
}

/**
 * Create the React root and render the application.
 * 
 * React.StrictMode is enabled to:
 * - Identify components with unsafe lifecycles
 * - Warn about legacy string ref API usage
 * - Warn about deprecated findDOMNode usage
 * - Detect unexpected side effects
 * - Detect legacy context API
 * 
 * Note: StrictMode causes components to render twice in development
 * to help detect side effects. This is normal and does not happen in production.
 */
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
