import { ProLayoutProps } from '@ant-design/pro-components';

/**
 * @name
 */
const Settings: ProLayoutProps & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: 'light',
  // 拂晓蓝
  colorPrimary: '#1677FF',
  layout: 'top', // 设置为顶部布局
  contentWidth: 'Fluid',
  fixedHeader: true,
  fixSiderbar: true,
  colorWeak: false,
  title: 'API 接口应用平台',
  pwa: false,
  logo: '/favicon.ico',
  iconfontUrl: '',
  token: {
    header: {
      colorBgHeader: '#fff',
      colorHeaderTitle: '#000',
      colorTextMenu: '#000',
      colorTextMenuSecondary: '#000',
      colorTextMenuSelected: '#1677FF',
      colorBgMenuItemSelected: '#e6f4ff',
      colorTextMenuActive: '#1677FF',
      colorTextRightActionsItem: '#000',
    },
  },
};

export default Settings;
