import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import cookies from 'js-cookie';
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_INFO } from './common/const';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const userInfo = cookies.get('auth_return');
const accessToken = cookies.get('access_token');
const refreshToken = cookies.get('refresh_token');
if (userInfo && accessToken && refreshToken) {
  localStorage.setItem(USER_INFO, userInfo);
  localStorage.setItem(ACCESS_TOKEN, accessToken);
  localStorage.setItem(REFRESH_TOKEN, refreshToken);

  cookies.remove('auth_return');
  cookies.remove('access_token');
  cookies.remove('refresh_token');
}
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
