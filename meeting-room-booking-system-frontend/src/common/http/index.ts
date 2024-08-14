import { message } from 'antd';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import queryString from 'query-string';

const defaultOptions = {
  timeout: 10000,
  baseURL: 'http://localhost:3105',
};

const instance = axios.create(defaultOptions);
let isRefreshing = false;
let requestQueue: Array<{
  config: AxiosRequestConfig;
  resolve: (val: any) => void;
}> = [];

export interface AjaxReturnType<T> {
  code: number;
  data: T;
  message: string;
}

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

instance.interceptors.response.use(
  (res) => {
    return res;
  },
  async (error) => {
    const { data, config } = error.response;
    if (isRefreshing) {
      return new Promise((resolve) => {
        requestQueue.push({ resolve, config });
      });
    }
    if (data.status === 401 && !config.isRefreshToken) {
      isRefreshing = true;
      const resp = await refreshToken();
      isRefreshing = false;
      if (resp.code === 200) {
        localStorage.setItem('access_token', resp.data.access_token);
        localStorage.setItem('refresh_token', resp.data.refresh_token);
        requestQueue.forEach((r, index) => {
          r.resolve(instance.request(r.config));
          if (index === requestQueue.length - 1) {
            requestQueue = [];
          }
        });
        return instance.request(config);
      } else {
        window.location.replace('/login');
      }
    }

    // console.log('error.response', error.response);
    if (!config.ignoreError) {
      message.error(error.response.data.data.message);
    }
    return Promise.reject(error.response.data);
  }
);

function refreshToken() {
  return GET<{
    access_token: string;
    refresh_token: string;
  }>('/user/refreshToken', {
    token: localStorage.getItem('refresh_token'),
    isRefreshToken: true,
  });
}

function createAjax<T>(
  url: string,
  ajaxConfig: AxiosRequestConfig
): Promise<AjaxReturnType<T>> {
  const ajaxSetting = Object.assign({ ignoreError: false, }, ajaxConfig, {
    url,
    headers: Object.assign(
      {},
      {
        'Content-type': 'application/json',
      },
      ajaxConfig.headers,
    ),
  });
  return instance
    .request<AxiosRequestConfig, AxiosResponse<AjaxReturnType<T>>>(ajaxSetting)
    .then((res) => {
      // console.log('res', res);
      if (res.status === 200) {
        return {
          code: res.data.code,
          data: res.data.data,
          message: res.data.message,
        };
      }
      return {
        code: res.status,
        data: res.data.data,
        message: res.statusText,
      };
    }).catch(err => {
      console.log('err', err);
      return {
        code: err.code,
        data: err.data,
        message: err.message,
      }
    });
}

export const GET = function<T>(url: string, params = {}, headers = {}) {
  const query = queryString.stringify(params);
  const char = url.indexOf('?') > -1 ? '&' : query ? '?' : '';
  return createAjax<T>(url + char + query, { method: 'GET', ...headers });
};

export const POST = function<T>(
  url: string,
  data = {},
  params = {},
  headers = {}
) {
  const search = queryString.stringify(params);
  const char = url.indexOf('?') > -1 ? '&' : search ? '?' : '';
  // return ;
  return createAjax<T>(url + char + search, {
    method: 'POST',
    data: JSON.stringify(data),
    ...headers,
  });
};
