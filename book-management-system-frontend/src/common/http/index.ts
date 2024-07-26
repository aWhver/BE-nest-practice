import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import queryString from 'query-string';
import { message } from 'antd';

export const BASEURL = 'http://localhost:3103';

const defaultOptions = {
  timeout: 10000,
  baseURL: BASEURL,
};
interface AjaxReturnType<T> extends AxiosResponse {
  data: {
    data: T;
    code: number;
    message: string;
  };
}

function ajaxObserver<T>(config: AxiosRequestConfig) {
  return new Observable<AjaxReturnType<T>>((subscribe) => {
    const instance = axios.create({
      ...defaultOptions,
    });
    const task = instance.request<AxiosRequestConfig, AjaxReturnType<T>>(
      config
    );
    task
      .then((res) => {
        subscribe.next(res);
        subscribe.complete();
      })
      .catch((err) => {
        if (err.response.status === 401) {
          message.error('登录失效，请重新登录');
          setTimeout(() => {
            window.location.href = '/login';
          }, 300);
        }
        console.log('err', err);
      });
  });
}

function createAjax<T>(url: string, ajaxConfig: AxiosRequestConfig) {
  const token = localStorage.getItem('token');
  const ajaxSetting = Object.assign({}, ajaxConfig, {
    url,
    headers: Object.assign(
      {},
      {
        'Content-type': 'application/json',
        Authorization:
          `Bearer ${token}` ||
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYmZkYmVmZC1iM2U2LTQ1NDgtOTE2NC00ZTc3NDNlMGI1NTciLCJ1c2VybmFtZSI6InpoYW9qdW50b25nMSIsImlhdCI6MTcyMDY4NTQ0MiwiZXhwIjoxNzIwNzIxNDQyfQ.byD3hihz_4qyEUDbGR-v43zncBqbLx3UFzXNrE7QeSY',
      },
      ajaxConfig.headers
    ),
  });
  return ajaxObserver<T>(ajaxSetting).pipe(
    catchError((err) => {
      return of({
        data: err.errMsg || { code: null, message: '网络错误' },
        code: err.errCode,
        status: err.status,
      });
    }),
    map((res) => {
      const { code, message } = res.data;
      // console.log('code, message', code, message);
      return {
        data: res.data.data,
        code,
        message,
        // status: res.status
      };
    })
  );
}

export const GET = function<T>(url: string, params = {}, headers = {}) {
  const search = queryString.stringify(params);
  const char = url.indexOf('?') > -1 ? '&' : search ? '?' : '';
  // return ;
  return createAjax<T>(url + char + search, { method: 'GET', ...headers });
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

export const PUT = function<T>(
  url: string,
  data = {},
  params = {},
  headers = {}
) {
  const search = queryString.stringify(params);
  const char = url.indexOf('?') > -1 ? '&' : search ? '?' : '';
  // return ;
  return createAjax<T>(url + char + search, {
    method: 'PUT',
    data: JSON.stringify(data),
    ...headers,
  });
};

export const DELETE = function<T>(
  url: string,
  data = {},
  params = {},
  headers = {}
) {
  const search = queryString.stringify(params);
  const char = url.indexOf('?') > -1 ? '&' : search ? '?' : '';
  // return ;
  return createAjax<T>(url + char + search, {
    method: 'DELETE',
    data: JSON.stringify(data),
    ...headers,
  });
};
