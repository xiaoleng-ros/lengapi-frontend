import { Footer } from '@/components';
import AvatarDropdown from '@/components/AvatarDropdown';
import {
  getLoginUserUsingGet,
  userLogoutUsingPost,
} from '@/services/lengapi-backend/userController';
import { getToken, removeToken } from '@/utils/auth';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { App as AntdApp } from 'antd';
import React from 'react';
import defaultSettings from '../config/defaultSettings';
import { requestConfig } from './requestConfig';

// 定义初始状态类型
interface InitialState {
  settings?: Partial<LayoutSettings>;
  currentUser?: API.LoginUserVO;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.LoginUserVO | undefined>;
}

// 手动定义 RunTimeLayoutConfig 类型
type RunTimeLayoutConfig = (params: {
  initialState: InitialState;
  setInitialState: (state: InitialState | ((s: InitialState) => InitialState)) => void;
}) => {
  // 基础配置
  layout: 'top' | 'side' | 'mix';
  contentWidth: 'Fluid' | 'Fixed';
  fixedHeader: boolean;

  // 组件渲染
  avatarProps: {
    render: () => React.ReactNode;
  };
  waterMarkProps?: {
    content?: string;
  };
  headerTitleRender?: () => React.ReactNode;
  footerRender?: () => React.ReactNode;
  menuHeaderRender?: undefined;
  childrenRender?: (children: React.ReactNode) => React.ReactNode;

  // 事件处理
  onPageChange?: () => void;

  // 背景配置
  layoutBgImgList?: Array<{
    src: string;
    left?: number;
    right?: number;
    bottom?: number;
    height?: string;
    width?: string;
  }>;

  // 其他配置
  [key: string]: any;
};

const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';
const defaultPath = '/interface_api'; // 修改为你想要的默认登录后跳转页面

// 定义不需要登录就能访问的路径
const PUBLIC_PATH = [
  '/user/login',
  '/user/register',
  '/welcome',
  '/',
  '/interface_api', // 只有接口广场是公开的
];

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<InitialState> {
  const fetchUserInfo = async () => {
    try {
      // 如果没有token，直接返回undefined
      const token = getToken();
      if (!token) {
        return undefined;
      }
      const msg = await getLoginUserUsingGet();
      return msg.data;
    } catch (error) {
      return undefined;
    }
  };

  // 获取用户信息
  const currentUser = await fetchUserInfo();

  return {
    fetchUserInfo,
    currentUser,
    settings: { ...defaultSettings } as Partial<LayoutSettings>,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  // 添加刷新用户信息的方法
  const handleUpdateUserInfo = async () => {
    if (initialState?.fetchUserInfo) {
      const currentUser = await initialState.fetchUserInfo();
      setInitialState((s) => ({
        ...s,
        currentUser,
      }));
    }
  };

  return {
    // 确保主题配置正确加载
    ...defaultSettings,
    ...initialState?.settings,

    // 然后是布局相关的强制配置
    layout: 'top',
    contentWidth: 'Fluid',
    fixedHeader: true,

    avatarProps: {
      render: () => {
        const handleLogin = () => {
          window.location.href = '/user/login';
        };

        const handleRegister = () => {
          window.location.href = '/user/register';
        };

        return (
          <AvatarDropdown
            items={
              initialState?.currentUser
                ? [
                    {
                      key: 'profile',
                      icon: <UserOutlined />,
                      label: '个人中心',
                      onClick: () => history.push('/profile'),
                    },
                    {
                      key: 'logout',
                      icon: <LogoutOutlined />,
                      label: '退出登录',
                      onClick: async () => {
                        try {
                          await userLogoutUsingPost();
                          // 清除token
                          removeToken();
                          await setInitialState((s) => ({
                            ...s,
                            currentUser: undefined,
                          }));
                          history.push('/welcome');
                        } catch (error) {
                          console.error('退出登录失败:', error);
                        }
                      },
                    },
                  ]
                : [
                    {
                      key: 'login',
                      label: '登录',
                      onClick: handleLogin,
                    },
                    {
                      key: 'register',
                      label: '注册',
                      onClick: handleRegister,
                    },
                  ]
            }
            currentUser={
              initialState?.currentUser
                ? {
                    userName: initialState.currentUser.userName || '未知用户',
                    userAvatar: initialState.currentUser.userAvatar,
                  }
                : { userName: '游客' }
            }
            isGuest={!initialState?.currentUser}
          />
        );
      },
    },
    waterMarkProps: {
      content: initialState?.currentUser ? initialState?.currentUser?.userName : '游客',
    },
    headerTitleRender: () => {
      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <a onClick={() => history.push('/')} style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/favicon.ico" alt="logo" style={{ height: '28px', marginRight: '12px' }} />
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#000' }}>
              API 接口服务平台
            </h1>
          </a>
        </div>
      );
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 每次页面切换时更新用户信息
      handleUpdateUserInfo();

      // 如果已登录且访问登录页，重定向到默认页面
      if (initialState?.currentUser && location.pathname === loginPath) {
        history.push(defaultPath);
        return;
      }
      // 如果未登录，只有访问需要登录的页面才重定向
      if (!initialState?.currentUser && !PUBLIC_PATH.includes(location.pathname)) {
        history.push(loginPath);
      }
    },
    layoutBgImgList: [
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr',
        left: 85,
        bottom: 100,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr',
        bottom: -68,
        right: -45,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr',
        bottom: 0,
        left: 0,
        width: '331px',
      },
    ],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      return (
        <AntdApp>
          {children}
          {isDev && initialState?.settings && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings: { ...settings },
                }));
              }}
            />
          )}
        </AntdApp>
      );
    },
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request = {
  ...requestConfig,
};
