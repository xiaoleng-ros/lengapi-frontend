import { uploadFileUsingPost } from '@/services/lengapi-backend/fileController';
import { updateMyUserUsingPost } from '@/services/lengapi-backend/userController';
import { CopyOutlined, UploadOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { Avatar, Button, Card, Form, Input, message, Modal, Select, Space, Upload } from 'antd';
import React, { useState } from 'react';

// 在文件顶部添加类型定义
interface CurrentUser extends API.LoginUserVO {
  email: string;
  gender: number;
  inviteCode?: string;
  userAccount?: string; // 添加 userAccount 类型
  userAvatar?: string; // 添加 userAvatar 类型
}

const Profile: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser as CurrentUser;
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleEmailSubmit = async (values: any) => {
    console.log('提交的邮箱和验证码:', values);
    // 这里添加调用后端API的代码来更新邮箱和验证码
    setIsModalVisible(false); // 提交后关闭模态框
  };

  // 性别显示转换
  const genderText = (value?: number) => {
    console.log('当前性别值:', value); // 添加调试输出，查看传入的性别值
    return value === 1 ? '女' : '男';
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      message.success('复制成功');
    });
  };

  // 头像上传前的校验
  const handleBeforeUpload = async (file: File): Promise<boolean> => {
    // 文件类型和大小验证
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('只能上传 JPG/PNG 格式的图片！');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2; // 限制 2MB
    if (!isLt2M) {
      message.error('图片必须小于 2MB！');
      return false;
    }
    return true;
  };

  // 处理头像上传
  const handleAvatarUpload = async (file: File) => {
    try {
      // 创建FormData并添加文件
      const formData = new FormData();
      formData.append('file', file);

      // 调用uploadFileUsingPost接口
      // 注意：根据fileController的实现，需要传递以下参数：
      // 1. params: 包含biz属性的对象
      // 2. body: 带有file的对象(会被fileController内部转换为FormData)
      const res = await uploadFileUsingPost(
        { biz: 'user_avatar' }, // 参数
        { file } as any, // 使用类型断言解决类型不匹配问题
        {}, // 可选参数
      );

      console.log('上传响应结果:', res);

      if (res.code === 0 && res.data) {
        message.success('头像上传成功');
        setInitialState((s) => ({
          ...s,
          currentUser: { ...s?.currentUser, userAvatar: res.data },
        }));
      } else {
        throw new Error(res.message || '未知错误');
      }
    } catch (error: any) {
      message.error('上传失败：' + error.message);
      console.error('上传错误详情:', error);
    }
  };

  // 修改 useEffect：无论是否编辑，只要用户数据变化就更新表单
  React.useEffect(() => {
    if (currentUser) {
      form.setFieldsValue({
        userName: currentUser.userName || currentUser.userAccount,
        gender: currentUser.gender,
      });
    }
  }, [currentUser]); // 依赖项改为 currentUser

  const onFinish = async (values: any) => {
    console.log('表单提交:', values);
    try {
      const updateParams = {
        userName: values.userName,
        userAvatar: currentUser?.userAvatar, // 使用当前用户的头像
        gender: Number(values.gender), // 强制转换为数字
      };

      const res = await updateMyUserUsingPost(updateParams);

      if (res.code === 0 && res.data === true) {
        // 检查更新是否成功
        message.success('更新成功');
        // 直接使用表单的值更新状态
        setInitialState((s) => ({
          ...s,
          currentUser: {
            ...s?.currentUser,
            userName: values.userName,
            gender: Number(values.gender),
          },
        }));

        form.setFieldsValue({
          userName: values.userName,
          gender: Number(values.gender),
        });
      } else {
        message.error('更新失败：' + (res.message || '未知错误'));
      }
    } catch (error: any) {
      message.error('更新失败：' + error.message);
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="个人信息设置"
        extra={
          <>
            <Button type="primary" style={{ marginRight: 8 }} onClick={showModal}>
              绑定邮箱
            </Button>
            <Modal
              open={isModalVisible}
              onCancel={handleCancel}
              footer={null}
              closable={false}
              centered
              width={500}
            >
              <Form layout="vertical" onFinish={handleEmailSubmit} style={{ padding: '20px' }}>
                <Form.Item
                  name="email"
                  rules={[{ required: true, message: '请输入邮箱地址!', type: 'email' }]}
                  style={{ marginBottom: '16px' }}
                >
                  <Input
                    placeholder="请输入邮箱地址"
                    variant={isEditing ? 'outlined' : 'borderless'}
                  />
                </Form.Item>
                <Form.Item style={{ marginBottom: '16px' }}>
                  <Space.Compact>
                    <Form.Item
                      name="verificationCode"
                      noStyle
                      rules={[{ required: true, message: '请输入验证码!' }]}
                    >
                      <Input
                        style={{ width: 'calc(100% - 100px)' }}
                        placeholder="请输入验证码"
                        variant={isEditing ? 'outlined' : 'borderless'}
                      />
                    </Form.Item>
                    <Button
                      type="primary"
                      onClick={() => message.info('验证码已发送')}
                      style={{ width: '100px' }}
                    >
                      获取验证码
                    </Button>
                  </Space.Compact>
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" block style={{ marginTop: '16px' }}>
                    绑定邮箱
                  </Button>
                </Form.Item>
              </Form>
            </Modal>
            <Button onClick={() => setIsEditing(!isEditing)}>{isEditing ? '取消' : '修改'}</Button>
          </>
        }
      >
        <div style={{ display: 'flex', gap: '24px' }}>
          {/* 左侧头像上传 */}
          <div>
            <Upload
              showUploadList={false}
              beforeUpload={handleBeforeUpload}
              customRequest={(req) => {
                // 自定义上传逻辑
                const file = req.file as File;
                handleAvatarUpload(file);
              }}
              accept=".jpg,.jpeg,.png"
            >
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  backgroundColor: '#f5f5f5',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                {currentUser?.userAvatar ? (
                  <Avatar size={100} src={currentUser.userAvatar} />
                ) : (
                  <>
                    <UploadOutlined style={{ fontSize: 24 }} />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </>
                )}
              </div>
            </Upload>
          </div>

          {/* 右侧信息表单 */}
          <div style={{ flex: 1 }}>
            <Form
              layout="horizontal"
              initialValues={{
                ...currentUser,
                gender: currentUser?.gender, // 保持为数字类型
              }}
              onFinish={onFinish}
              labelAlign="left"
              labelCol={{ span: 100 }}
              wrapperCol={{ span: 18 }}
              style={{ maxWidth: 800 }}
              form={form}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Form.Item
                  label="昵称"
                  name="userName"
                  rules={[{ max: 6, message: '昵称最多6个字符' }]}
                >
                  <Input
                    disabled={!isEditing}
                    placeholder="请输入昵称（最多6个字符）"
                    bordered={isEditing}
                    style={{
                      width: '12em',
                      color: 'rgba(0, 0, 0, 0.85)',
                      WebkitTextFillColor: 'rgba(0, 0, 0, 0.85) !important',
                    }}
                    variant={isEditing ? 'outlined' : 'borderless'}
                  />
                </Form.Item>

                <Form.Item label="性别">
                  {isEditing ? (
                    <Form.Item name="gender">
                      <Select
                        style={{ width: 120 }}
                        options={[
                          { value: 0, label: '男' },
                          { value: 1, label: '女' },
                        ]}
                      />
                    </Form.Item>
                  ) : (
                    <Input
                      bordered={false}
                      readOnly
                      value={genderText(currentUser?.gender)} // 直接读 currentUser
                      style={{
                        color: 'rgba(0, 0, 0, 0.85)',
                        WebkitTextFillColor: 'rgba(0, 0, 0, 0.85)',
                      }}
                      variant={isEditing ? 'outlined' : 'borderless'}
                    />
                  )}
                </Form.Item>

                <Form.Item label="我的ID">
                  <Input.Group compact>
                    <Input
                      value={currentUser?.id}
                      disabled
                      bordered={false}
                      style={{
                        width: '12em',
                        color: 'rgba(0, 0, 0, 0.85)',
                        WebkitTextFillColor: 'rgba(0, 0, 0, 0.85) !important',
                      }}
                      variant={isEditing ? 'outlined' : 'borderless'}
                    />
                    <Button
                      type="link"
                      icon={<CopyOutlined />}
                      onClick={() => handleCopy(currentUser?.id?.toString() || '')}
                    />
                  </Input.Group>
                </Form.Item>

                <Form.Item label="我的邮箱">
                  <Input
                    value={currentUser?.email || '未绑定邮箱'}
                    disabled
                    bordered={false}
                    style={{
                      width: '12em',
                      color: 'rgba(0, 0, 0, 0.85)',
                      WebkitTextFillColor: 'rgba(0, 0, 0, 0.85) !important',
                    }}
                    variant={isEditing ? 'outlined' : 'borderless'}
                  />
                </Form.Item>

                {isEditing && (
                  <Form.Item style={{ margin: '16px 0 0 0' }}>
                    <Button type="primary" htmlType="submit">
                      保存
                    </Button>
                  </Form.Item>
                )}
              </div>
            </Form>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Profile;
