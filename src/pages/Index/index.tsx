import { PageContainer } from '@ant-design/pro-components';
import { Card, Typography, theme } from 'antd';
import React from 'react';
import {
  SmileOutlined,
  RocketOutlined,
  ApiOutlined,
  BookOutlined,
  SafetyOutlined,
} from '@ant-design/icons';

const { Title, Paragraph, Link } = Typography;

const Welcome: React.FC = () => {
  const { token } = theme.useToken();

  const features = [
    {
      icon: <ApiOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      title: '多样化的接口选择',
      description: '平台提供丰富多样的接口供您选择，涵盖了7个个领域的功能和服务，满足不同需求。',
      number: '1',
    },
    {
      icon: <RocketOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      title: '在线调试功能',
      description: '您可以在平台上进行接口在线调试，快速验证接口的功能和效果，节省开发调试的时间和工作量。',
      number: '2',
    },
    {
      icon: <SmileOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      title: '客户端SDK支持',
      description: '为了方便开发者集成接口到自己的项目中，平台提供了客户端SDK，使调用接口变得更加简单和便捷。',
      number: '3',
    },
    {
      icon: <BookOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      title: '详细的开发者文档',
      description: '平台提供了详细的开发者文档，帮助开发者快速接入和发布接口，解决遇到的问题和困难。',
      number: '4',
    },
    {
      icon: <SafetyOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      title: '安全和稳定',
      description: '平台致力于提供安全和稳定的接口调用服务，采用了安全措施和技术手段，保障用户数据的安全性和隐私保护。',
      number: '5',
    },
  ];

  return (
    <PageContainer>
      <Card
        style={{
          borderRadius: 8,
        }}
        bodyStyle={{
          backgroundImage:
            'background-image: linear-gradient(75deg, #FBFDFF 0%, #F5F7FF 100%)',
        }}
      >
        <Typography
          style={{
            background: token.colorBgContainer,
            padding: '24px',
          }}
        >
          <Title level={2}>欢迎使用 API 接口服务平台 🎉</Title>
          <Paragraph>
            API 接口服务平台是一个为用户和开发者提供全面 API 接口调用服务的平台 🚀
          </Paragraph>

          <Paragraph>
            <SmileOutlined /> 作为用户，您可以根据自己的需求浏览和选择合适的接口，并通过登录/邀请/购买积分来获取接口调用权限。您可以在线进行接口调试，快速验证接口的功能和效果。
          </Paragraph>

          <Paragraph>
            <RocketOutlined /> 作为开发者，我们提供了<Link>客户端SDK</Link>，通过开发者凭证即可将 API 接口轻松集成到您的项目中，实现更高效的开发和调用。
          </Paragraph>

          <Paragraph>
            <ApiOutlined /> 您可以将自己的接口接入到 API 接口服务平台上，并发布给其他用户使用。您可以管理自己的各个接口，以便更好地分析和优化接口性能。
          </Paragraph>

          <Paragraph>
            <BookOutlined /> 我们还提供了详细的开发者文档和技术支持，帮助您快速地接入和发布接口。
          </Paragraph>

          <Paragraph>
            <SafetyOutlined /> 无论您是用户还是开发者，API 接口服务平台都致力于提供安全、稳定、高效的接口调用服务，帮助您实现更快速、便捷的开发和调用体验。
          </Paragraph>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '40px' }}>
            {features.map((feature) => (
              <Card
                key={feature.title}
                style={{
                  width: 300,
                  borderRadius: 8,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  {feature.icon}
                  <span
                    style={{
                      marginLeft: '8px',
                      fontSize: '18px',
                      fontWeight: 'bold',
                    }}
                  >
                    {feature.title}
                  </span>
                </div>
                <Paragraph>{feature.description}</Paragraph>
              </Card>
            ))}
          </div>
        </Typography>
      </Card>
    </PageContainer>
  );
};

export default Welcome;
