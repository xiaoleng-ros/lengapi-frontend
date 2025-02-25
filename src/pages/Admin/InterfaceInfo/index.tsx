import { PlusOutlined } from '@ant-design/icons';
import {
  ActionType,
  FooterToolbar,
  PageContainer,
  ProColumns,
  ProDescriptions,
  ProDescriptionsItemProps,
  ProFormSelect,
  ProTable,
} from '@ant-design/pro-components';
import '@umijs/max';
import { Button, Drawer, message, Modal } from 'antd';
import React, { useRef, useState } from 'react';

import {
  addInterfaceInfoUsingPost,
  deleteInterfaceInfoUsingPost,
  listInterfaceInfoByPageUsingGet,
  offlineInterfaceInfoUsingPost,
  onlineInterfaceInfoUsingPost,
  updateInterfaceInfoUsingPost,
} from '@/services/lengapi-backend/interfaceInfoController';

import CreateModal from '@/pages/Admin/InterfaceInfo/components/CreateModal';
import UpdateModal from '@/pages/Admin/InterfaceInfo/components/UpdateModal';

const TableList: React.FC = () => {
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  const [updateModalOpen, setUpdateModalOpen] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.InterfaceInfo>();
  const [selectedRowsState, setSelectedRows] = useState<API.InterfaceInfo[]>([]);

  const handleUpdateModalOpen = (open: boolean) => {
    if (open && currentRow) {
      console.log('Current Row:', currentRow);
    }
    setUpdateModalOpen(open);
  };

  const handleAdd = async (fields: API.InterfaceInfo) => {
    const hide = message.loading('正在添加');
    try {
      await addInterfaceInfoUsingPost({ ...fields } as API.InterfaceInfoAddRequest);
      hide();
      message.success('创建成功');
      handleModalOpen(false);
      // 添加这行来刷新表格
      actionRef.current?.reload();
      return true;
    } catch (error: any) {
      hide();
      message.error('创建失败.' + error.message);
      return false;
    }
  };

  const handleUpdate = async (fields: API.InterfaceInfo) => {
    if (!currentRow) {
      return;
    }
    const hide = message.loading('修改中');
    try {
      await updateInterfaceInfoUsingPost({ id: currentRow.id, ...fields });
      hide();
      message.success('操作成功');
      return true;
    } catch (error: any) {
      hide();
      message.error('操作失败,' + error.message);
      return false;
    }
  };

  const handleOnline = async (record: API.IdRequest) => {
    const hide = message.loading('发布中');
    if (!record) return true;
    try {
      await onlineInterfaceInfoUsingPost({ id: record.id });
      hide();
      message.success('发布成功');
      actionRef.current?.reload();
      return true;
    } catch (error: any) {
      hide();
      message.error('发布失败,' + error.message);
      return false;
    }
  };

  const handleOffline = async (record: API.IdRequest) => {
    const hide = message.loading('下线中');
    if (!record) return true;
    try {
      await offlineInterfaceInfoUsingPost({ id: record.id });
      hide();
      message.success('下线成功');
      actionRef.current?.reload();
      return true;
    } catch (error: any) {
      hide();
      message.error('下线失败,' + error.message);
      return false;
    }
  };

  const handleRemove = async (record: API.InterfaceInfo) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除接口 "${record.name}" 吗？`,
      okText: '确认',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        const hide = message.loading('正在删除');
        if (!record.id) return true;
        try {
          await deleteInterfaceInfoUsingPost({
            id: record.id,
          });
          hide();
          message.success('删除成功');
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

  const columns: ProColumns<API.InterfaceInfo>[] = [
    { title: 'id', dataIndex: 'id', valueType: 'index' },
    {
      title: '接口名称',
      dataIndex: 'name',
      valueType: 'text',
      formItemProps: { rules: [{ required: true }] },
    },
    {
      title: '描述',
      dataIndex: 'description',
      valueType: 'textarea',
      formItemProps: { rules: [{ required: true }] },
    },
    {
      title: '请求方法',
      dataIndex: 'method',
      valueType: 'select',
      fieldProps: {
        as: ProFormSelect,
        options: [
          { label: 'GET', value: 'GET' },
          { label: 'POST', value: 'POST' },
          { label: 'PUT', value: 'PUT' },
          { label: 'DELETE', value: 'DELETE' },
          { label: 'PATCH', value: 'PATCH' },
        ],
      },
      formItemProps: { rules: [{ required: true }] },
    },
    {
      title: 'url',
      dataIndex: 'url',
      valueType: 'text',
      formItemProps: { rules: [{ required: true }] },
    },
    {
      title: '请求参数',
      dataIndex: 'requestParams',
      valueType: 'jsonCode',
      formItemProps: { rules: [{ required: true }] },
    },
    {
      title: '请求头',
      dataIndex: 'requestHeader',
      valueType: 'jsonCode',
      formItemProps: { rules: [{ required: true }] },
    },
    {
      title: '响应头',
      dataIndex: 'responseHeader',
      valueType: 'jsonCode',
      formItemProps: { rules: [{ required: true }] },
    },
    {
      title: '状态',
      dataIndex: 'status',
      hideInForm: true,
      valueEnum: {
        0: { text: '关闭', status: 'Default' },
        1: { text: '开启', status: 'Processing' },
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
      hideInForm: true,
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      valueType: 'dateTime',
      hideInForm: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="config"
          onClick={() => {
            handleUpdateModalOpen(true);
            setCurrentRow(record);
          }}
        >
          修改
        </a>,
        <Button
          type={record.status === 1 ? 'text' : 'link'}
          danger={record.status === 1}
          key="online"
          onClick={() => {
            if (record.status === 1) {
              handleOffline(record);
            } else {
              handleOnline(record);
            }
          }}
        >
          {record.status === 1 ? '下线' : '发布'}
        </Button>,
        <Button
          type="text"
          danger
          key="delete"
          onClick={() => {
            handleRemove(record);
          }}
        >
          删除
        </Button>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.RuleListItem, API.PageParams>
        headerTitle={'查询表格'}
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 120 }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              handleModalOpen(true);
            }}
          >
            <PlusOutlined /> 新建
          </Button>,
        ]}
        request={async (params) => {
          const res: any = await listInterfaceInfoByPageUsingGet({
            ...params,
          } as API.listInterfaceInfoByPageUsingGETParams);
          if (res?.data) {
            return {
              data: res?.data.records || [],
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
            setSelectedRows(selectedRows as API.InterfaceInfo[]);
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
          <Button
            danger
            onClick={async () => {
              await handleRemove(selectedRowsState[0]);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            批量删除
          </Button>
        </FooterToolbar>
      )}

      <UpdateModal
        columns={columns}
        onSubmit={async (value) => {
          const success = await handleUpdate(value);
          if (success) {
            handleUpdateModalOpen(false);
            setCurrentRow(undefined);
            if (actionRef.current) {
              actionRef.current?.reload();
            }
          }
        }}
        onCancel={() => {
          handleUpdateModalOpen(false);
          if (!showDetail) {
            setCurrentRow(undefined);
          }
        }}
        open={updateModalOpen}
        values={currentRow || {}}
      />

      <Drawer
        width={600}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.name && (
          <ProDescriptions<API.RuleListItem>
            column={2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.name,
            }}
            columns={columns as ProDescriptionsItemProps<API.RuleListItem>[]}
          />
        )}
      </Drawer>
      <CreateModal
        columns={columns}
        onCancel={() => {
          handleModalOpen(false);
        }}
        onSubmit={async (values) => {
          const success = await handleAdd(values);
          if (success) {
            actionRef.current?.reload();
          }
        }}
        open={createModalOpen}
      />
    </PageContainer>
  );
};

export default TableList;
