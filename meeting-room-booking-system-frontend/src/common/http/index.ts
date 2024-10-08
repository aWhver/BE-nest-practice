import { message } from 'antd';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import queryString from 'query-string';
import { ACCESS_TOKEN, REFRESH_TOKEN, SERVER } from '../const';

const defaultOptions = {
  timeout: 10000,
  baseURL: SERVER,
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
  const token = localStorage.getItem(ACCESS_TOKEN);
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
    if (config.isRefreshToken) {
      return error.response;
    }
    if (isRefreshing) {
      return new Promise((resolve) => {
        requestQueue.push({ resolve, config });
      });
    }
    if (data.statusCode === 401 && !config.isRefreshToken) {
      isRefreshing = true;
      const resp = await refreshToken();
      isRefreshing = false;
      if (resp.code === 200) {
        localStorage.setItem(ACCESS_TOKEN, resp.data.access_token);
        localStorage.setItem(REFRESH_TOKEN, resp.data.refresh_token);
        requestQueue.forEach((r, index) => {
          r.resolve(instance.request(r.config));
          if (index === requestQueue.length - 1) {
            requestQueue = [];
          }
        });
        return instance.request(config);
      } else {
        setTimeout(() => {
          window.location.replace('/login');
        }, 800);
      }
    }

    // console.log('error.response', error.response);
    if (!config.ignoreError) {
      // 守卫里抛出的错误不会经过拦截器包裹一层
      message.error(error.response.data?.data?.message || error.response.data.message);
    }
    return Promise.reject(error.response.data);
  }
);

function refreshToken() {
  return GET<{
    access_token: string;
    refresh_token: string;
  }>('/user/refreshToken', {
    token: localStorage.getItem(REFRESH_TOKEN),
  }, { isRefreshToken: true });
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

export const GET = function<T>(url: string, params = {}, ajaxConfig = {}) {
  const query = queryString.stringify(params);
  const char = url.indexOf('?') > -1 ? '&' : query ? '?' : '';
  return createAjax<T>(url + char + query, { method: 'GET', ...ajaxConfig });
};

export const POST = function<T>(
  url: string,
  data = {},
  params = {},
  ajaxConfig = {}
) {
  const search = queryString.stringify(params);
  const char = url.indexOf('?') > -1 ? '&' : search ? '?' : '';
  // return ;
  return createAjax<T>(url + char + search, {
    method: 'POST',
    data: JSON.stringify(data),
    ...ajaxConfig,
  });
};

export const PUT = function<T>(
  url: string,
  data = {},
  params = {},
  ajaxConfig = {}
) {
  const search = queryString.stringify(params);
  const char = url.indexOf('?') > -1 ? '&' : search ? '?' : '';
  // return ;
  return createAjax<T>(url + char + search, {
    method: 'PUT',
    data: JSON.stringify(data),
    ...ajaxConfig,
  });
};

export const PATCH = function<T>(
  url: string,
  data = {},
  params = {},
  ajaxConfig = {}
) {
  const search = queryString.stringify(params);
  const char = url.indexOf('?') > -1 ? '&' : search ? '?' : '';
  // return ;
  return createAjax<T>(url + char + search, {
    method: 'PATCH',
    data: JSON.stringify(data),
    ...ajaxConfig,
  });
};

export const DELETE = function<T>(
  url: string,
  data = {},
  params = {},
  ajaxConfig = {}
) {
  const search = queryString.stringify(params);
  const char = url.indexOf('?') > -1 ? '&' : search ? '?' : '';
  // return ;
  return createAjax<T>(url + char + search, {
    method: 'DELETE',
    data: JSON.stringify(data),
    ...ajaxConfig,
  });
};
