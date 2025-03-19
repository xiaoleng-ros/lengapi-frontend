import type { RequestOptions } from '@@/plugin-request/request';
import { message } from 'antd';
import {
  getRefreshToken,
  getToken,
  isTokenExpired,
  logout,
  setRefreshToken,
  setToken,
} from './utils/auth';

// 错误处理方案： 错误类型
enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}

// 与后端约定的响应数据格式
interface ResponseStructure {
  success: boolean;
  data: any;
  errorCode?: number;
  errorMessage?: string;
  showType?: ErrorShowType;
}

// 错误处理配置
export const errorConfig = {
  // 错误处理： umi@3 的错误处理方案。
  errorConfig: {
    // 错误抛出
    errorThrower: (res: unknown) => {
      const { success, data, errorCode, errorMessage, showType } =
        res as unknown as ResponseStructure;
      if (!success) {
        const error: any = new Error(errorMessage || 'Unknown error');
        error.name = 'BizError';
        error.info = { errorCode, errorMessage, showType, data };
        throw error; // 抛出自制的错误
      }
    },
    // 错误接收及处理
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;
      // 我们的 errorThrower 抛出的错误。
      if (error.name === 'BizError') {
        const errorInfo: ResponseStructure | undefined = error.info;
        if (errorInfo) {
          const { errorMessage } = errorInfo;
          switch (errorInfo.showType) {
            case ErrorShowType.SILENT:
              // do nothing
              break;
            case ErrorShowType.WARN_MESSAGE:
              message.warning(errorMessage);
              break;
            case ErrorShowType.ERROR_MESSAGE:
              message.error(errorMessage);
              break;
            case ErrorShowType.NOTIFICATION:
              break;
            case ErrorShowType.REDIRECT:
              // TODO: redirect
              break;
            default:
              message.error(errorMessage);
          }
        }
      } else if (error.response) {
        // Axios 的错误
        // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
        message.error(`Response status: ${error.response.status}`);
      } else if (error.request) {
        // 请求已经成功发起，但没有收到响应
        // \`error.request\` 在浏览器中是 XMLHttpRequest 的实例，
        // 而在node.js中是 http.ClientRequest 的实例
        message.error('None response! Please retry.');
      } else {
        // 发送请求时出了点问题
        message.error('Request error, please retry.');
      }
    },
  },
};

// 添加类型定义
interface RequestConfig {
  baseURL?: string;
  withCredentials?: boolean;
  requestInterceptors?: any[];
  responseInterceptors?: any[];
  errorConfig?: {
    errorThrower?: (res: any) => void;
    errorHandler?: (error: any, opts: any) => void;
  };
}

interface RefreshResponse {
  success: boolean;
  data: {
    token: string;
    refreshToken: string;
  };
}

// 导出请求配置
export const requestConfig: RequestConfig = {
  baseURL:
    process.env.NODE_ENV === 'development'
      ? '' // 开发环境使用相对路径，因为已经配置了代理
      : 'https://119.91.248.232', // 生产环境使用实际的 API 地址
  withCredentials: false, // JWT不需要携带cookie

  ...errorConfig,

  // 请求拦截器
  requestInterceptors: [
    (config: RequestOptions) => {
      // 添加token到请求头
      const token = getToken();
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }

      // 确保请求路径以/api开头
      const url = config.url?.startsWith('/api') ? config.url : `/api${config.url}`;
      return { ...config, url };
    },
  ],

  // 响应拦截器
  responseInterceptors: [
    async (response: Response & { config: RequestOptions; data: ResponseStructure }) => {
      const { data, config } = response;

      // 如果是刷新token的请求，直接返回
      if (config.url?.includes('/auth/refresh')) {
        return response;
      }

      // 检查token是否即将过期
      const token = getToken();
      if (token && isTokenExpired(token)) {
        try {
          const refreshToken = getRefreshToken();
          if (!refreshToken) {
            throw new Error('No refresh token');
          }

          // 发起刷新token请求
          const refreshResult: RefreshResponse = await fetch(
            `${requestConfig.baseURL}/auth/refresh`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${refreshToken}`,
              },
            },
          ).then((res: Response) => res.json());

          if (refreshResult.success) {
            setToken(refreshResult.data.token);
            setRefreshToken(refreshResult.data.refreshToken);

            // 使用新token重试原请求
            config.headers = {
              ...config.headers,
              Authorization: `Bearer ${refreshResult.data.token}`,
            };

            // 转换为 fetch 所需的格式
            const fetchOptions: RequestInit = {
              method: config.method,
              headers: config.headers as HeadersInit,
              body: config.data ? JSON.stringify(config.data) : undefined,
              mode: 'cors',
              credentials: config.withCredentials ? 'include' : 'same-origin',
            };
            return fetch(config.url || '', fetchOptions).then((res) => res.json());
          } else {
            throw new Error('Refresh token failed');
          }
        } catch (error) {
          // 刷新token失败，登出用户
          logout();
          throw new Error('Session expired, please login again');
        }
      }

      // 处理业务错误
      if (data?.success === false) {
        if (data.errorCode === 401) {
          logout();
        }
        message.error(data.errorMessage || '请求失败！');
      }
      return response;
    },
  ],
};

export default requestConfig;
