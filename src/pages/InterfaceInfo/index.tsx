import {
  getInterfaceInfoByIdUsingGet,
  invokeInterfaceInfoUsingPost,
} from '@/services/lengapi-backend/interfaceInfoController';
import { useParams } from '@@/exports';
import {
  Button,
  Card,
  Descriptions,
  Divider,
  Empty,
  Form,
  Input,
  message,
  Modal,
  Table,
} from 'antd';
import React, { useEffect, useState } from 'react';

// 添加行号
// 定义一个函数，给 JSON 的每一行添加行号
const formatJSONWithLineNumbers = (json: any, indent = 2): string => {
  const jsonString = JSON.stringify(json, null, indent);
  const lines = jsonString.split('\n').filter((line) => line.trim() !== ''); // 除去空行
  return lines
    .map((line, index) => `${index + 1} ${line}`) // 添加行号
    .join('\n');
};

// 首先定义一些类型
const Index: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [title, setTitle] = useState<string>('获取用户名');
  const params = useParams();
  const [tableData, setTableData] = useState<any[]>([]);
  const [invokeRes, setInvokeRes] = useState<any>(null);
  const [invokeLoading, setInvokeLoading] = useState(false);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);
  const inactivityTimeout = 1000 * 60 * 15;
  const [sessTimeout, setSessTimeout] = useState(false);
  const [activeTabKey2, setActiveTabKey2] = useState<'app' | 'code'>('app');

  // 负责加载数据 - 移到这里
  const loadData = async () => {
    if (!params.id) {
      message.error('参数不存在');
      return;
    }
    setLoading(true);
    try {
      const res = await getInterfaceInfoByIdUsingGet({
        id: Number(params.id),
      });
      setData(res.data);
      setTitle(res.data?.name || '获取用户名');
    } catch (error: any) {
      message.error('请求失败' + error.message);
    }
    setLoading(false);
  };

  // 监听用户操作事件
  const handleUserActivity = () => {
    console.log('User activity detected');
    if (timeoutId) clearTimeout(timeoutId);
    setTimeoutId(
      window.setTimeout(() => {
        console.log('Idle timeout triggered');
        setSessTimeout(true);
      }, inactivityTimeout) as unknown as number,
    );
  };

  // 处理会话超时的弹窗
  const openSessionTimeoutModal = () => {
    Modal.error({
      title: '会话超时',
      content: '由于长时间未操作，您的会话已超时，请重新登录。',
      okText: '重新登录',
      onOk() {
        // 跳转到登录页面
        window.location.href = '/user/login';
      },
    });
  };

  // 重置按钮处理函数
  const handleReset = () => {
    if (sessTimeout) {
      openSessionTimeoutModal();
      return;
    }
    Modal.confirm({
      title: '确认重置',
      content: '确定要清空表格中的数据吗？',
      okText: '确认',
      okType: 'danger', // 确认按钮红色
      cancelText: '取消',
      onOk() {
        setTableData([]); // 清空表格数据
        message.success('数据已重置！');
      },
      onCancel() {
        console.log('取消重置');
      },
    });
  };

  // 删除按钮处理函数
  const handleDelete = (key: string) => {
    if (sessTimeout) {
      openSessionTimeoutModal();
      return;
    }
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条数据吗？',
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        setTableData(tableData.filter((item) => item.key !== key));
        message.success('删除成功！');
      },
      onCancel() {
        console.log('取消删除');
      },
    });
  };

  // 会话超时检测
  const startTimer = () => {
    setTimeoutId(
      window.setTimeout(() => {
        setSessTimeout(true);
      }, inactivityTimeout) as unknown as number,
    );
  };

  useEffect(() => {
    // 初始化定时器
    startTimer();

    // 监听用户操作事件
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keypress', handleUserActivity);
    window.addEventListener('touchmove', handleUserActivity);

    // 组件卸载时清除定时器和事件监听
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keypress', handleUserActivity);
      window.removeEventListener('touchmove', handleUserActivity);
    };
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  // 错误码数据
  const errorCodes = [
    { key: '1', 参数名称: 'SUCCESS', 错误码: 0, 描述: 'ok' },
    { key: '2', 参数名称: 'PARAMS_ERROR', 错误码: 40000, 描述: '请求参数错误' },
    { key: '3', 参数名称: 'NO_AUTH_ERROR', 错误码: 40101, 描述: '无权限' },
    { key: '4', 参数名称: 'FORBIDDEN_ERROR', 错误码: 40300, 描述: '禁止访问' },
    { key: '5', 参数名称: 'NOT_FOUND_ERROR', 错误码: 40400, 描述: '请求数据不存在' },
    { key: '6', 参数名称: 'SYSTEM_ERROR', 错误码: 50000, 描述: '系统内部异常' },
    { key: '7', 参数名称: 'OPERATION_ERROR', 错误码: 50001, 描述: '操作失败' },
  ];

  // 表格列定义
  const columns = [
    { title: '参数名称', dataIndex: '参数名称', key: '参数名称', width: '30%' },
    { title: '错误码', dataIndex: '错误码', key: '错误码', width: '30%' },
    { title: '描述', dataIndex: '描述', key: '描述', width: '40%' },
  ];

  // 标签页配置
  const tabListNoTitle = [
    { key: 'app', label: '在线调试' },
    { key: 'code', label: '错误码参考' },
  ];

  // 更新调用总次数
  const updateInterfaceTotal = async () => {
    if (!params.id) {
      message.error('接口不存在');
      return;
    }
    try {
      const res = await getInterfaceInfoByIdUsingGet({
        id: Number(params.id),
      });
      setData((prevData: any) => ({
        ...prevData,
        interfaceTotal: res.data?.interfaceTotal || 0,
      }));
    } catch (error: any) {
      message.error('请求失败' + error.message);
    }
  };

  // 发送请求处理函数
  const handleInvoke = async () => {
    if (sessTimeout) {
      openSessionTimeoutModal();
      return;
    }
    if (!params.id) {
      message.error('接口不存在');
      return;
    }
    if (!tableData.length) {
      message.error('请先输入请求参数');
      return;
    }
    setInvokeLoading(true);
    try {
      const requestData: Record<string, string> = tableData.reduce(
        (acc: Record<string, string>, item) => {
          acc[item.name] = item.value;
          return acc;
        },
        {},
      );

      const response = await invokeInterfaceInfoUsingPost({
        id: Number(params.id), // 确保转换为数字
        userRequestParams: JSON.stringify(requestData),
      });

      // 处理响应
      if (response.code === 401) {
        // 使用 code 而不是 status
        openSessionTimeoutModal();
      } else {
        setInvokeRes(response.data);
        message.success('请求成功');
      }
    } catch (error: any) {
      if (error.response?.code === 401) {
        openSessionTimeoutModal();
      } else {
        message.error(`请求失败: ${error.message}`);
        setInvokeRes(null);
      }
    } finally {
      setInvokeLoading(false);
      await updateInterfaceTotal();
    }
  };

  // Card 的 onTabChange 处理函数
  const onTab2Change = (key: string) => {
    if (key === 'app' || key === 'code') {
      setActiveTabKey2(key);
    }
  };

  // 标签页内容
  const contentListNoTitle: Record<'app' | 'code', React.ReactNode> = {
    app: (
      <div>
        <Form layout="inline" style={{ marginBottom: 16 }}>
          <Form.Item style={{ margin: '0 8px' }}>
            <Input value={data?.method || ''} style={{ width: 120 }} readOnly={true} />
          </Form.Item>
          <Form.Item style={{ margin: '0 8px' }}>
            <Input value={data?.url || ''} style={{ width: 400 }} readOnly={true} />
          </Form.Item>
          <Form.Item style={{ margin: '0 8px' }}>
            <Button
              type="primary"
              htmlType="submit"
              onClick={() => handleInvoke()}
              loading={invokeLoading}
              style={{ marginLeft: 10 }}
            >
              发送请求
            </Button>
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleReset} danger>
              重置
            </Button>
          </Form.Item>
        </Form>

        <Divider />

        <Form layout="vertical">
          <Form.Item label="请求参数">
            <Table
              columns={[
                {
                  title: '参数名称',
                  dataIndex: 'name',
                  key: 'name',
                  render: (text, record) => (
                    <Input
                      defaultValue={record.name}
                      style={{ width: 200 }}
                      onChange={(e) =>
                        setTableData(
                          tableData.map((item) =>
                            item.key === record.key ? { ...item, name: e.target.value } : item,
                          ),
                        )
                      }
                    />
                  ),
                },
                {
                  title: '参数值',
                  dataIndex: 'value',
                  key: 'value',
                  render: (text, record) => (
                    <Input
                      defaultValue={record.value}
                      style={{ width: 200 }}
                      onChange={(e) =>
                        setTableData(
                          tableData.map((item) =>
                            item.key === record.key ? { ...item, value: e.target.value } : item,
                          ),
                        )
                      }
                    />
                  ),
                },
                {
                  title: '操作',
                  dataIndex: 'operation',
                  key: 'operation',
                  render: (text, record) => (
                    <Button type="link" onClick={() => handleDelete(record.key)}>
                      删除
                    </Button>
                  ),
                },
              ]}
              dataSource={tableData}
              pagination={false}
            />
            <Button
              type="dashed"
              style={{ width: '100%', marginTop: 16 }}
              onClick={() => {
                const newRowKey = Date.now().toString();
                setTableData([...tableData, { key: newRowKey, name: '', value: '' }]);
              }}
            >
              + 添加一行数据
            </Button>
          </Form.Item>
        </Form>

        <Divider />

        <div>
          <h3>返回结果：</h3>
          {invokeRes ? (
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                backgroundColor: '#f5f5f5', // 添加背景颜色
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #eaeaea',
              }}
            >
              {formatJSONWithLineNumbers(invokeRes)}
            </pre>
          ) : (
            <Empty description="未发起调用，暂无请求信息" />
          )}
        </div>
      </div>
    ),
    code: (
      <Table
        columns={columns}
        dataSource={errorCodes}
        pagination={false}
        style={{ width: '60%' }}
      />
    ),
  };

  return (
    <div>
      <Card title={title} loading={loading}>
        {data ? (
          <Descriptions column={3}>
            <Descriptions.Item label="接口状态">
              {data.status ? '已上线' : '已下线'}
            </Descriptions.Item>
            <Descriptions.Item label="描述">{data.description}</Descriptions.Item>
            <Descriptions.Item label="请求地址">{data.url}</Descriptions.Item>
            <Descriptions.Item label="请求方法">{data.method}</Descriptions.Item>
            <Descriptions.Item label="调用总次数">{data.interfaceTotal}</Descriptions.Item>
            <Descriptions.Item label="请求参数">{data.requestParams}</Descriptions.Item>
            <Descriptions.Item label="请求头">{data.requestHeader}</Descriptions.Item>
            <Descriptions.Item label="响应头">{data.responseHeader}</Descriptions.Item>
          </Descriptions>
        ) : (
          <div>接口不存在</div>
        )}
      </Card>

      <Card
        style={{ width: '100%', marginTop: 16 }}
        tabList={tabListNoTitle}
        activeTabKey={activeTabKey2}
        tabBarExtraContent={<a href="#">More</a>}
        onTabChange={onTab2Change}
        tabProps={{ size: 'middle' }}
      >
        {contentListNoTitle[activeTabKey2]}
      </Card>
    </div>
  );
};

export default Index;
