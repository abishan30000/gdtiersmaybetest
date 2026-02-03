import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/globals.css';
import { AuthProvider, ConfigProvider, EntriesProvider } from './lib/store';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider>
      <AuthProvider>
        <EntriesProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </EntriesProvider>
      </AuthProvider>
    </ConfigProvider>
  </React.StrictMode>
);
