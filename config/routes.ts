export default [
  {
    path: '/user',
    layout: false,
    routes: [
      { path: '/user/login', component: './User/Login' },
      { path: '/user/register', component: './User/Register' },
    ],
  },
  {
    path: '/welcome',
    name: '欢迎',
    icon: 'smile',
    component: './Index',
  },
  {
    path: '/interface_api',
    name: '接口广场',
    icon: 'api',
    component: './Admin/InterfaceAPI',
  },
  {
    path: '/interface_info/:id',
    name: '查看接口',
    icon: 'smile',
    component: './InterfaceInfo',
    hideInMenu: true,
    access: 'canUser',
  },
  {
    path: '/admin',
    name: '管理页面',
    icon: 'crown',
    access: 'showAdmin',
    routes: [
      {
        path: '/admin/interface_info',
        name: '接口管理',
        component: './Admin/InterfaceInfo',
        access: 'canAdmin',
      },
      {
        path: '/admin/interface_analysis',
        name: '接口分析',
        component: './Admin/InterfaceAnalysis',
        access: 'canAdmin',
      },
      {
        path: '/admin/user_management',
        name: '用户管理',
        component: './Admin/UserManagement',
        access: 'canAdmin',
      },
    ],
  },
  {
    path: '/profile',
    name: '个人中心',
    icon: 'UserOutlined',
    component: './Profile',
    hideInMenu: true,
  },
  {
    path: '/',
    redirect: '/welcome',
  },
  {
    path: '*',
    layout: false,
    component: './404',
  },
];
