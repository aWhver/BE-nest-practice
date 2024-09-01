import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ACCESS_TOKEN, SERVER } from '../const';
import { message } from 'antd';
import queryString from 'query-string';

// declare module 'axios' {
//   interface AxiosResponse {
//     AxiosResponseHeaders: {
//       token: string;
//     };
//   }
// }

interface AjaxReturnType<T> {
  data: T;
  code: number;
  message: string;
}

export const instance = axios.create({
  baseURL: SERVER,
  timeout: 10000,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (res) => {
    if (typeof res.headers.get === 'function' && res.headers.get('token')) {
      localStorage.setItem(ACCESS_TOKEN, res.headers.get('token') as string);
    }
    return res;
  },
  (error) => {
    const { config, data } = error.response;
    if (data.code === 401) {
      localStorage.removeItem(ACCESS_TOKEN);
      setTimeout(() => {
        window.location.replace('/login');
      }, 800);
    }
    if (!config.ignoreError) {
      message.error(data.data);
    }
    return Promise.reject(data);
  }
);

function createAjax<T>(
  url: string,
  ajaxConfig: AxiosRequestConfig
): Promise<AjaxReturnType<T>> {
  const ajaxSetting = Object.assign({ ignoreError: false }, ajaxConfig, {
    url,
    headers: Object.assign(
      {},
      {
        'Content-type': 'application/json',
      },
      ajaxConfig.headers
    ),
  });

  return instance
    .request<AxiosRequestConfig, AxiosResponse<AjaxReturnType<T>>>(ajaxSetting)
    .then((res) => {
      return {
        code: res.data.code,
        data: res.data.data,
        message: res.data.message,
      };
    });
}

export const GET = <T>(url: string, params = {}, ajaxConfig = {}) => {
  return createAjax<T>(
    url,
    Object.assign({ method: 'GET', params }, ajaxConfig)
  );
};

export const POST = <T>(
  url: string,
  data = {},
  params = {},
  ajaxConfig = {}
) => {
  const search = queryString.stringify(params);
  const char = url.indexOf('?') > -1 ? '&' : search ? '?' : '';
  return createAjax<T>(
    url + char + search,
    Object.assign({ method: 'POST', data: JSON.stringify(data) }, ajaxConfig)
  );
};
