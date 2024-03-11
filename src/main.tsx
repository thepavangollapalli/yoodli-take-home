import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import App from './App.tsx';
import AuthStart from './AuthStart.tsx';
import AuthCallback from './AuthCallback.tsx';
import CatalogSearch from './CatalogSearch.tsx';

import './index.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/login",
    element: <AuthStart />,
  },
  {
    path: "/callback",
    element: <AuthCallback />
  },
  {
    path: "/search",
    element: <CatalogSearch />
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
