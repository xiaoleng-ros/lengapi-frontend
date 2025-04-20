// 文件 1: AvatarDropdown 组件
import { UserOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';
import { Avatar } from 'antd';
import type { MenuInfo } from 'rc-menu/lib/interface';
import React, { useCallback } from 'react';
import HeaderDropdown from '../HeaderDropdown';

export type GlobalHeaderRightProps = {
  menu?: boolean;
  items?: any[];
  currentUser?: {
    userName: string;
    userAvatar?: string;
  };
  isGuest?: boolean;
};

const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({ items, currentUser }) => {
  const onMenuClick = useCallback((event: MenuInfo) => {
    const { key } = event;
    history.push(`/${key}`);
  }, []);

  return (
    <HeaderDropdown
      menu={{
        selectedKeys: [],
        onClick: onMenuClick,
        items: items,
      }}
    >
      <span
        style={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '15px', // 增大字体大小
          marginLeft: '-100px', // 向左移动
        }}
      >
        <Avatar
          size="large" // 增大头像大小
          src={currentUser?.userAvatar}
          icon={<UserOutlined />}
          alt="avatar"
        />
        <span>{currentUser?.userName}</span>
      </span>
    </HeaderDropdown>
  );
};

export default AvatarDropdown;
