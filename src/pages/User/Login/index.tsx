import { Footer } from '@/components';
import {
  sendVerificationCodeUsingPost,
  userLoginUsingPost,
} from '@/services/lengapi-backend/userController';
import { setRefreshToken, setToken } from '@/utils/auth';
import {
  AlipayCircleOutlined,
  LockOutlined,
  MailOutlined,
  TaobaoCircleOutlined,
  UserOutlined,
  WeiboCircleOutlined,
} from '@ant-design/icons';
import {
  LoginForm,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { Helmet, history, useModel } from '@umijs/max';
import { Alert, message, Tabs } from 'antd';
import { createStyles } from 'antd-style';
import React, { useState } from 'react';
import Settings from '../../../../config/defaultSettings';

// 定义样式接口
interface LoginStyles {
  action: string;
  lang: string;
  container: string;
}

const useStyles = createStyles<LoginStyles>(({ token }) => ({
  action: {
    marginLeft: '8px',
    color: 'rgba(0, 0, 0, 0.2)',
    fontSize: '24px',
    verticalAlign: 'middle',
    cursor: 'pointer',
    transition: 'color 0.3s',
    '&:hover': {
      color: token.colorPrimaryActive,
    },
  },
  lang: {
    width: 42,
    height: 42,
    lineHeight: '42px',
    position: 'fixed',
    right: 16,
    borderRadius: token.borderRadius,
    ':hover': {
      backgroundColor: token.colorBgTextHover,
    },
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'auto',
    backgroundImage:
      "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
    backgroundSize: '100% 100%',
  },
}));

const ActionIcons = () => {
  const { styles } = useStyles();
  return (
    <>
      <AlipayCircleOutlined key="AlipayCircleOutlined" className={(styles as any).action} />
      <TaobaoCircleOutlined key="TaobaoCircleOutlined" className={(styles as any).action} />
      <WeiboCircleOutlined key="WeiboCircleOutlined" className={(styles as any).action} />
    </>
  );
};
const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};
const Login: React.FC = () => {
  const [userLoginState] = useState<API.LoginResult>({});
  const [type, setType] = useState<string>('account');
  const { setInitialState } = useModel('@@initialState');
  const { styles } = useStyles();

  // 显式断言 styles 的类型
  const containerStyle = (styles as Record<string, string>).container;

  const handleSubmit = async (values: API.UserLoginRequest) => {
    try {
      // 根据登录类型处理不同的登录逻辑
      const loginParams =
        type === 'account'
          ? {
              userAccount: values.userAccount,
              userPassword: values.userPassword,
            }
          : {
              email: values.email, // 修改这里，从 userEmail 改为 email
              verificationCode: values.verificationCode,
            };

      // 登录
      const res = await userLoginUsingPost(loginParams);
      if (res.data) {
        const { token, refreshToken, user } = res.data;

        // 检查用户状态
        if (user.isDelete === 1) {
          message.error('该账号已被注销，无法登录');
          return;
        }

        // 检查用户是否被封禁
        if (user.userRole === 'ban') {
          message.error('该账号已被封禁，请联系管理员');
          return;
        }

        // 保存token
        setToken(token);
        setRefreshToken(refreshToken);

        const urlParams = new URL(window.location.href).searchParams;
        history.push(urlParams.get('redirect') || '/');
        await setInitialState((s) => ({
          ...s,
          currentUser: user,
        }));
        // 登录成功提示
        message.success('登录成功');
        return;
      }
    } catch (error) {
      const defaultLoginFailureMessage =
        type === 'account' ? '登录失败，用户不存在或密码错误' : '登录失败，邮箱或验证码错误';
      console.log(error);
      message.error(defaultLoginFailureMessage);
    }
  };
  const { status, type: loginType } = userLoginState;
  return (
    <div className={containerStyle}>
      <Helmet>
        <title>
          {'登录'}- {Settings.title}
        </title>
      </Helmet>
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <LoginForm
          // 删除 form 属性
          // form={form}
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw',
          }}
          logo={<img alt="logo" src="/favicon.ico" />}
          title="API 接口应用平台"
          subTitle={'API 接口应用平台为用户和开发者提供全面API接口调用 '}
          initialValues={{
            autoLogin: true,
          }}
          actions={['其他登录方式 :', <ActionIcons key="icons" />]}
          onFinish={async (values) => {
            await handleSubmit(values as API.UserLoginRequest);
          }}
        >
          <Tabs
            activeKey={type}
            onChange={setType}
            centered
            items={[
              {
                key: 'account',
                label: '账户登录',
              },
              {
                key: 'email',
                label: '邮箱登录',
              },
            ]}
          />

          {status === 'error' && loginType === 'account' && (
            <LoginMessage content={'错误的用户名和密码'} />
          )}
          {type === 'account' && (
            <>
              <ProFormText
                name="userAccount"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined />,
                }}
                placeholder={'请输入用户名'}
                rules={[
                  {
                    required: true,
                    message: '用户名是必填项！',
                  },
                ]}
              />
              <ProFormText.Password
                name="userPassword"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                placeholder={'请输入密码'}
                rules={[
                  {
                    required: true,
                    message: '密码是必填项！',
                  },
                ]}
              />
            </>
          )}

          {status === 'error' && loginType === 'email' && <LoginMessage content="验证码错误" />}
          {type === 'email' && (
            <>
              <ProFormText
                fieldProps={{
                  size: 'large',
                  prefix: <MailOutlined />,
                  id: 'email', // 修改这里，从 userEmail 改为 email
                }}
                name="email" // 修改这里，从 userEmail 改为 email
                placeholder={'请输入邮箱'}
                rules={[
                  {
                    required: true,
                    message: '邮箱是必填项！',
                  },
                  {
                    type: 'email',
                    message: '不合法的邮箱格式！',
                  },
                ]}
              />
              <ProFormCaptcha
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                captchaProps={{
                  size: 'large',
                }}
                placeholder={'请输入验证码'}
                captchaTextRender={(timing, count) => {
                  if (timing) {
                    return `${count} 秒后重新获取`;
                  }
                  return '获取验证码';
                }}
                phoneName="userEmail" // 关键修改：指定关联的字段名为userEmail
                name="verificationCode"
                rules={[
                  {
                    required: true,
                    message: '验证码是必填项！',
                  },
                ]}
                onGetCaptcha={async () => {
                  // 直接从表单中获取邮箱值
                  const emailInput = document.getElementById('email') as HTMLInputElement; // 修改这里，从 userEmail 改为 email
                  const email = emailInput?.value;

                  // 验证邮箱是否为空
                  if (!email || !email.trim()) {
                    message.error('请先输入邮箱！');
                    return Promise.reject('请先输入邮箱！');
                  }

                  // 验证邮箱格式
                  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
                  if (!emailRegex.test(email)) {
                    message.error('请输入正确的邮箱格式！');
                    return Promise.reject('请输入正确的邮箱格式！');
                  }

                  try {
                    const result = await sendVerificationCodeUsingPost({
                      email: email.trim(),
                    });
                    if (result.data) {
                      message.success('验证码发送成功！');
                      return;
                    }
                  } catch (error) {
                    message.error('验证码发送失败，请稍后重试！');
                    return Promise.reject('验证码发送失败');
                  }
                }}
              />
            </>
          )}
          <div
            style={{
              marginBottom: 24,
            }}
          >
            <ProFormCheckbox noStyle name="autoLogin">
              自动登录
            </ProFormCheckbox>
            <a
              style={{
                float: 'right',
              }}
              onClick={() => {
                history.push('/user/register');
              }}
            >
              没有帐号？请前往注册
            </a>
          </div>
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};
export default Login;
