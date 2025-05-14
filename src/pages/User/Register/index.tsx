import { Footer } from '@/components';
import {
  sendVerificationCodeUsingPost,
  userRegisterUsingPost,
} from '@/services/lengapi-backend/userController';
import { GiftOutlined, LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormCaptcha, ProFormText } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { message, Tabs } from 'antd';
import { createStyles } from 'antd-style';
import React, { useState } from 'react';

const useStyles = createStyles(() => {
  return {
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    },
  };
});

const Register: React.FC = () => {
  const [type, setType] = useState<string>('account');
  const { styles } = useStyles();

  const handleSubmit = async (values: API.UserRegisterRequest) => {
    const { userPassword, checkPassword } = values;
    // 校验密码
    if (userPassword !== checkPassword) {
      message.error('两次输入的密码不一致');
      return;
    }

    try {
      // 注册
      const res = await userRegisterUsingPost({
        ...values,
      });
      if (res.data) {
        const defaultLoginSuccessMessage = '注册成功！';
        message.success(defaultLoginSuccessMessage);

        // 注册成功后跳转到登录页
        history.push('/user/login');
        return;
      } else {
        message.error('注册失败，' + (res.message || '请重试！'));
      }
    } catch (error: any) {
      // 处理具体的错误情况
      const errorMessage = error.response?.data?.message || error.message || '注册失败，请重试！';

      if (errorMessage.includes('账号重复')) {
        message.error('该账号已被注册，请更换其他账号');
      } else if (errorMessage.includes('邮箱已被使用')) {
        message.error('该邮箱已被注册，请更换其他邮箱');
      } else {
        message.error(errorMessage);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <LoginForm
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw',
          }}
          logo={<img alt="logo" src="/favicon.ico" />}
          title="API 接口应用平台"
          subTitle={'API 接口应用平台为用户和开发者提供全面 API 接口调用服务'}
          submitter={{
            searchConfig: {
              submitText: '注册',
            },
          }}
          onFinish={async (values) => {
            await handleSubmit(values as API.UserRegisterRequest);
          }}
        >
          <Tabs
            activeKey={type}
            onChange={setType}
            centered
            items={[
              {
                key: 'account',
                label: '账户注册',
              },
              {
                key: 'email',
                label: '邮箱注册',
              },
            ]}
          />
          {type === 'account' && (
            <>
              <ProFormText
                name="userName"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                placeholder={'请输入昵称'}
                rules={[
                  {
                    required: true,
                    message: '昵称是必填项！',
                  },
                  {
                    min: 2,
                    type: 'string',
                    message: '昵称长度不能小于 2',
                  },
                ]}
              />
              <ProFormText
                name="userAccount"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined />,
                }}
                placeholder={'请输入账号'}
                rules={[
                  {
                    required: true,
                    message: '账号是必填项！',
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
                  {
                    min: 8,
                    type: 'string',
                    message: '密码长度不能小于 8',
                  },
                ]}
              />
              <ProFormText.Password
                name="checkPassword"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                placeholder={'请再次输入密码'}
                rules={[
                  {
                    required: true,
                    message: '确认密码是必填项！',
                  },
                  {
                    min: 8,
                    type: 'string',
                    message: '密码长度不能小于 8',
                  },
                ]}
              />
              <ProFormText
                name="inviteCode"
                fieldProps={{
                  size: 'large',
                  prefix: <GiftOutlined />,
                }}
                placeholder={'请输入邀请码,没有可不填'}
              />
            </>
          )}
          {type === 'email' && (
            <>
              <ProFormText
                name="userName"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined />,
                }}
                placeholder={'请输入昵称'}
                rules={[
                  {
                    required: true,
                    message: '昵称是必填项！',
                  },
                  {
                    min: 2,
                    type: 'string',
                    message: '昵称长度不能小于 2',
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
                  {
                    min: 8,
                    type: 'string',
                    message: '密码长度不能小于 8',
                  },
                ]}
              />
              <ProFormText.Password
                name="checkPassword"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                placeholder={'请再次输入密码'}
                rules={[
                  {
                    required: true,
                    message: '确认密码是必填项！',
                  },
                  {
                    min: 8,
                    type: 'string',
                    message: '密码长度不能小于 8',
                  },
                ]}
              />
              <ProFormText
                fieldProps={{
                  size: 'large',
                  prefix: <MailOutlined />,
                  id: 'email',
                }}
                name="email"
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
                name="verificationCode"
                phoneName="email"
                rules={[
                  {
                    required: true,
                    message: '验证码是必填项！',
                  },
                ]}
                onGetCaptcha={async () => {
                  const emailInput = document.getElementById('email') as HTMLInputElement;
                  const email = emailInput?.value;

                  if (!email || !email.trim()) {
                    message.error('请先输入邮箱！');
                    return Promise.reject('请先输入邮箱！');
                  }

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
              <ProFormText
                name="inviteCode"
                fieldProps={{
                  size: 'large',
                  prefix: <GiftOutlined />,
                }}
                placeholder={'请输入邀请码,没有可不填'}
              />
            </>
          )}
          <div
            style={{
              marginBottom: 65,
            }}
          >
            <a
              style={{
                float: 'right',
              }}
              onClick={() => {
                history.push('/user/login');
              }}
            >
              已有帐号？去登录
            </a>
          </div>
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};

export default Register;
