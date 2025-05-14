import { GithubOutlined, InfoCircleOutlined, WechatOutlined } from '@ant-design/icons';
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
        {
          key: 'info',
          title: (
            <>
              <InfoCircleOutlined /> 免责声明
            </>
          ),
          href: 'https://github.com/xiaoleng-ros/iceuu.icu/blob/main/%E6%8E%A5%E5%8F%A3%E7%94%A8%E6%88%B7%E5%8D%8F%E8%AE%AE.md#%E4%B8%83%E5%85%8D%E8%B4%A3%E5%A3%B0%E6%98%8E',
          blankTarget: true,
        },
        {
          key: 'beian',
          title: <span className={'text-blue-500'}>豫ICP备2023004098号-1</span>,
          href: 'https://beian.miit.gov.cn/',
          blankTarget: true,
        },
      ]}
      copyright={'2025 小冷出品'}
    />
  );
};

export default Footer;
