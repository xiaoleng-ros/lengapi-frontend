import { GithubOutlined, WechatOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import { Popover } from 'antd';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      links={[
        {
          key: 'github',
          title: (
            <>
              <GithubOutlined style={{ marginRight: 5 }} />
              支持项目
            </>
          ),
          href: 'https://github.com/xiaoleng-ros/lengapi-backend',
          blankTarget: true,
        },
        {
          key: 'weixin',
          title: (
            <Popover
              content={<img src="/xiaoleng.jpg" alt="联系作者" style={{ width: 130 }} />}
              trigger="hover"
            >
              <span style={{ cursor: 'pointer' }}>
                <WechatOutlined style={{ marginRight: 5 }} />
                联系作者
              </span>
            </Popover>
          ),
          href: '#',
        },
      ]}
      copyright={'2025 小冷出品'}
    />
  );
};

export default Footer;
