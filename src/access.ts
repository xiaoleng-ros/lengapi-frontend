/**
 * @see https://umijs.org/docs/max/access#access
 * */
export default function access(initialState: { currentUser?: API.LoginUserVO } | undefined) {
  const { currentUser } = initialState ?? {};
  return {
    // 只有管理员可以访问
    canAdmin: currentUser?.userRole === 'admin',
    // 登录用户可以访问
    canUser: !!currentUser,
    // 管理员菜单显示权限
    showAdmin: currentUser?.userRole === 'admin',
  };
}
