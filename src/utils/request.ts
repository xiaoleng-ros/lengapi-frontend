import { history } from '@umijs/max';
import { message } from 'antd';
import { extend } from 'umi-request';

/**
 * 配置request请求时的默认参数
 */
const request = extend({
  prefix: '/api',
  credentials: 'include',
  timeout: 5000,
});

/**
 * 请求拦截器
 */
request.interceptors.request.use((url, options) => {
  const token = localStorage.getItem('token');
  if (token) {
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };
    return {
      url,
      options: { ...options, headers },
    };
  }
  return { url, options };
});

/**
 * 响应拦截器
 */
request.interceptors.response.use(async (response) => {
  const data = await response.clone().json();

  if (data.code === 401) {
    // token过期或未登录
    localStorage.removeItem('token');
    message.error('登录已过期，请重新登录');
    history.push('/user/login');
  }

  if (!data.success) {
    message.error(data.message || '请求失败');
  }

  return response;
});

export default request;
