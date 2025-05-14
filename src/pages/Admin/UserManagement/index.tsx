import { currentUser } from '@/services/ant-design-pro/api';
import {
  deleteUserUsingPost,
  listUserVoByPageUsingPost,
  updateUserUsingPost,
} from '@/services/lengapi-backend/userController';
import { CopyOutlined, PlusOutlined } from '@ant-design/icons';
import {
  ActionType,
  FooterToolbar,
  PageContainer,
  ProColumns,
  ProFormInstance,
  ProTable,
} from '@ant-design/pro-components';
import '@umijs/max';
import { Button, Drawer, Form, Input, message, Modal, Select } from 'antd';
import React, { useRef, useState } from 'react';

declare module '@/services/ant-design-pro/api' {
  interface CurrentUser {
    id: number;
    userName?: string;
    userAccount?: string;
    userAvatar?: string;
    userRole?: string;
  }
}

// 用户接口，匹配后端返回的UserVO类型
interface User {
  id: number;
  userName: string;
  userAccount: string;
  userAvatar: string;
  secretKey: string;
  accessKey: string;
  userRole: string;
  gender: number;
  updateTime: string;
  createTime: string;
  isDelete?: number;
}

const TableList: React.FC = () => {
  const [selectedRowsState, setSelectedRows] = useState<User[]>([]);
  const actionRef = useRef<ActionType>();

  // 编辑用户的抽屉状态
  const [editDrawerVisible, setEditDrawerVisible] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User>();
  const [form] = Form.useForm();

  useRef<ProFormInstance>();
  // 打开编辑抽屉
  const handleEditUser = (record: User) => {
    setEditingUser(record);
    setEditDrawerVisible(true);
    // 设置表单初始值
    form.setFieldsValue({
      userName: record.userName,
      userAccount: record.userAccount,
      userAvatar: record.userAvatar,
      userRole: record.userRole,
      gender: record.gender,
    });
  };

  // 删除用户功能
  const handleRemove = async (record: User) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除用户 "${record.userName}" 吗？`,
      okText: '确认',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        const hide = message.loading('正在删除');
        try {
          // 调用后端 API 删除用户
          const res = await deleteUserUsingPost({ userId: record.id });
          // 检查删除是否成功
          if (!res?.data) {
            hide();
            message.error('删除失败，请重试');
            return false;
          }
          // 检查返回的布尔值
          if (res.data !== true) {
            hide();
            message.error('删除失败，后端处理异常');
            return false;
          }
          hide();
          message.success('删除成功');
          // 刷新表格数据
          actionRef.current?.reload();
          return true;
        } catch (error: any) {
          hide();
          message.error('删除失败，' + error.message);
          return false;
        }
      },
    });
  };

  // 批量删除用户
  const handleBatchRemove = async (selectedRows: User[]) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedRows.length} 个用户吗？`,
      okText: '确认',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        const hide = message.loading('正在删除');
        if (!selectedRows) return true;
        try {
          // 批量删除用户
          for (const record of selectedRows) {
            const res = await deleteUserUsingPost({ userId: record.id });
            // 检查删除是否成功
            if (!res?.data) {
              hide();
              message.error(`删除用户 "${record.userName}" 失败，请重试`);
              return false;
            }
            // 检查返回的布尔值
            if (res.data !== true) {
              hide();
              message.error(`删除用户 "${record.userName}" 失败，后端处理异常`);
              return false;
            }
          }
          hide();
          message.success('批量删除成功');
          setSelectedRows([]);
          // 刷新表格数据
          actionRef.current?.reload();
          return true;
        } catch (error: any) {
          hide();
          message.error('批量删除失败，' + error.message);
          return false;
        }
      },
    });
  };

  // 处理用户状态更新（封号/解封）
  const handleUpdateStatus = async (record: User) => {
    // 检查是否是当前登录用户
    if (currentUser && currentUser.id === record.id) {
      message.error('不能修改自己的角色状态');
      return;
    }

    const newRole = record.userRole === 'ban' ? 'user' : 'ban';
    const hide = message.loading('正在更新状态');
    try {
      await updateUserUsingPost({
        id: record.id,
        userRole: newRole,
      });
      hide();
      message.success(`${newRole === 'ban' ? '封号' : '解封'}成功`);
      actionRef.current?.reload();
    } catch (error: any) {
      hide();
      message.error('操作失败：' + error.message);
    }
  };

  // 批量封号功能
  const handleBatchBan = async (selectedRows: User[]) => {
    Modal.confirm({
      title: '确认封号',
      content: `确定要封禁选中的 ${selectedRows.length} 个用户吗？`,
      okText: '确认',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        const hide = message.loading('正在处理');
        if (!selectedRows) return true;
        try {
          // 批量封号用户
          for (const record of selectedRows) {
            // 跳过当前登录用户
            if (currentUser && currentUser.id === record.id) {
              continue;
            }
            await updateUserUsingPost({
              id: record.id,
              userRole: 'ban',
            });
          }
          hide();
          message.success('批量封号成功');
          setSelectedRows([]);
          // 刷新表格数据
          actionRef.current?.reload();
          return true;
        } catch (error: any) {
          hide();
          message.error('批量封号失败，' + error.message);
          return false;
        }
      },
    });
  };

  // 批量解封功能
  const handleBatchUnban = async (selectedRows: User[]) => {
    Modal.confirm({
      title: '确认解封',
      content: `确定要解封选中的 ${selectedRows.length} 个用户吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        const hide = message.loading('正在处理');
        if (!selectedRows) return true;
        try {
          // 批量解封用户
          for (const record of selectedRows) {
            // 跳过当前登录用户
            if (currentUser && currentUser.id === record.id) {
              continue;
            }
            await updateUserUsingPost({
              id: record.id,
              userRole: 'user', // 解封后默认设置为普通用户
            });
          }
          hide();
          message.success('批量解封成功');
          setSelectedRows([]);
          // 刷新表格数据
          actionRef.current?.reload();
          return true;
        } catch (error: any) {
          hide();
          message.error('批量解封失败，' + error.message);
          return false;
        }
      },
    });
  };

  const columns: ProColumns<User>[] = [
    { title: '昵称', dataIndex: 'userName', valueType: 'text' },
    { title: '账号', dataIndex: 'userAccount', valueType: 'text' },
    {
      title: '头像',
      dataIndex: 'userAvatar',
      valueType: 'image',
      render: (_, record) => (
        <img
          src={record.userAvatar || 'default-avatar.png'}
          alt="头像"
          style={{ width: 30, height: 30, borderRadius: '50%' }}
        />
      ),
    },
    {
      title: 'AccessKey',
      dataIndex: 'accessKey',
      valueType: 'text',
      render: (text) => {
        if (!text) return '-';
        const value = text as string;
        const displayText = `${value.slice(0, 10)}...`;
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {displayText}
            <Button
              type="link"
              icon={<CopyOutlined />}
              onClick={() => {
                navigator.clipboard.writeText(value);
                message.success('复制成功');
              }}
            />
          </div>
        );
      },
    },
    {
      title: 'SecretKey',
      dataIndex: 'secretKey',
      valueType: 'text',
      render: (text) => {
        if (!text) return '-';
        const value = text as string;
        const displayText = `${value.slice(0, 10)}...`;
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {displayText}
            <Button
              type="link"
              icon={<CopyOutlined />}
              onClick={() => {
                navigator.clipboard.writeText(value);
                message.success('复制成功');
              }}
            />
          </div>
        );
      },
    },
    {
      title: '角色/权限',
      dataIndex: 'userRole',
      valueType: 'select',
      valueEnum: {
        admin: { text: '管理员' },
        user: { text: '用户' },
        ban: { text: '封号' },
      },
      render: (_, record) => {
        // 如果是当前登录用户，添加提示信息
        if (currentUser && currentUser.id === record.id) {
          return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {record.userRole === 'admin'
                ? '管理员'
                : record.userRole === 'user'
                ? '用户'
                : '封号'}
              <span style={{ marginLeft: 8, color: '#999', fontSize: '12px' }}>
                (无法修改自己的角色)
              </span>
            </div>
          );
        }
        return record.userRole === 'admin'
          ? '管理员'
          : record.userRole === 'user'
          ? '用户'
          : '封号';
      },
    },
    {
      title: '性别',
      dataIndex: 'gender',
      valueType: 'select',
      valueEnum: {
        0: { text: '男' },
        1: { text: '女' },
      },
    },
    { title: '创建时间', dataIndex: 'createTime', valueType: 'dateTime' },
    { title: '更新时间', dataIndex: 'updateTime', valueType: 'dateTime' },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => {
        const isCurrentUser = currentUser && currentUser.id === record.id;
        return [
          <a key="edit" onClick={() => handleEditUser(record)}>
            修改
          </a>,
          isCurrentUser ? (
            <a key="ban" onClick={() => message.warning('不能对自己进行封号操作')}>
              {record.userRole === 'ban' ? '解封' : '封号'}
            </a>
          ) : (
            <a key="ban" onClick={() => handleUpdateStatus(record)}>
              {record.userRole === 'ban' ? '解封' : '封号'}
            </a>
          ),
          isCurrentUser ? (
            <Button
              type="text"
              danger
              key="delete"
              onClick={() => message.warning('不能删除自己的账号')}
            >
              删除
            </Button>
          ) : (
            <Button
              type="text"
              danger
              key="delete"
              onClick={() => {
                handleRemove(record);
              }}
            >
              删除
            </Button>
          ),
        ];
      },
    },
  ];

  // 提交编辑表单
  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser?.id) {
        // 检查是否是当前登录用户且尝试修改角色
        if (
          currentUser &&
          currentUser.id === editingUser.id &&
          values.userRole !== editingUser.userRole
        ) {
          message.warning('不能修改自己的角色/权限');
          // 重置角色选择为原来的值
          form.setFieldValue('userRole', editingUser.userRole);
          return;
        }

        const hide = message.loading('正在更新');
        try {
          await updateUserUsingPost({
            id: editingUser.id,
            ...values,
          });
          hide();
          message.success('更新成功');
          setEditDrawerVisible(false);
          actionRef.current?.reload();
        } catch (error: any) {
          hide();
          message.error('更新失败，' + error.message);
        }
      }
    } catch (error) {
      console.log('表单验证失败:', error);
    }
  };

  return (
    <PageContainer>
      <ProTable<User>
        headerTitle="用户管理"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
          filterType: 'light',
        }}
        // 添加分页配置
        pagination={{
          pageSize: 6,
          showSizeChanger: false, // 不显示页面大小选择器
        }}
        toolBarRender={() => [
          <Button type="primary" key="primary" onClick={() => message.info('新建用户功能开发中')}>
            <PlusOutlined /> 新建
          </Button>,
        ]}
        request={async (params) => {
          const res = await listUserVoByPageUsingPost({
            ...params,
            sortField: 'id',
            sortOrder: 'ascend',
          });
          if (res?.data) {
            return {
              data: res.data.records || [],
              success: true,
              total: res.data.total || 0,
            };
          } else {
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              已选择 <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a> 项
            </div>
          }
        >
          <Button onClick={() => handleBatchBan(selectedRowsState)} style={{ marginRight: 8 }}>
            批量封号
          </Button>
          <Button onClick={() => handleBatchUnban(selectedRowsState)} style={{ marginRight: 8 }}>
            批量解封
          </Button>
          <Button danger onClick={() => handleBatchRemove(selectedRowsState)}>
            批量删除
          </Button>
        </FooterToolbar>
      )}
      {/* 编辑用户抽屉 */}
      <Drawer
        title="编辑用户"
        width={400}
        open={editDrawerVisible}
        onClose={() => setEditDrawerVisible(false)}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setEditDrawerVisible(false)} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" onClick={handleEditSubmit}>
              提交
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="userName"
            label="昵称"
            rules={[{ required: true, message: '请输入昵称' }]}
          >
            <Input placeholder="请输入昵称" />
          </Form.Item>
          <Form.Item
            name="userAccount"
            label="账号"
            rules={[{ required: true, message: '请输入账号' }]}
          >
            <Input placeholder="请输入账号" disabled />
          </Form.Item>
          <Form.Item name="userAvatar" label="头像URL">
            <Input placeholder="请输入头像URL" />
          </Form.Item>
          <Form.Item
            name="userRole"
            label="角色/权限"
            rules={[{ required: true, message: '请选择角色' }]}
            tooltip={
              currentUser && currentUser.id === editingUser?.id
                ? '不能修改自己的角色/权限'
                : undefined
            }
          >
            <Select disabled={currentUser && currentUser.id === editingUser?.id}>
              <Select.Option value="admin">管理员</Select.Option>
              <Select.Option value="user">用户</Select.Option>
              <Select.Option value="ban">封禁</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="gender" label="性别">
            <Select>
              <Select.Option value={0}>男</Select.Option>
              <Select.Option value={1}>女</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Drawer>
    </PageContainer>
  );
};

export default TableList;
