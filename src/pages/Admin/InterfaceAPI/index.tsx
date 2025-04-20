import { listInterfaceInfoByPageUsingGet } from '@/services/lengapi-backend/interfaceInfoController';
import { PageContainer } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { List, message } from 'antd';
import React, { useEffect, useState } from 'react';

/**
 * 接口广场页面
 * 展示所有可用的API接口
 */
const Index: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<API.InterfaceInfo[]>([]);
  const [total, setTotal] = useState<number>(0);

  const loadData = async (current = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const res = await listInterfaceInfoByPageUsingGet({
        current,
        pageSize,
      });

      if (res?.data) {
        setList(res.data.records || []);
        setTotal(res.data.total || 0);
      } else {
        message.error('获取数据失败');
      }
    } catch (error: any) {
      message.error('请求失败：' + (error.message || '未知错误'));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleViewDetail = (id: number | undefined) => {
    if (id) {
      history.push(`/interface_info/${id}`);
    } else {
      message.error('接口ID不存在');
    }
  };

  return (
    <PageContainer title="API接口广场">
      <List
        className="my-list"
        loading={loading}
        itemLayout="horizontal"
        dataSource={list}
        renderItem={(item) => {
          return (
            <List.Item
              actions={[
                <a key={item.id} onClick={() => handleViewDetail(item.id)}>
                  查看
                </a>,
              ]}
            >
              <List.Item.Meta
                title={<a onClick={() => handleViewDetail(item.id)}>{item.name}</a>}
                description={item.description}
              />
            </List.Item>
          );
        }}
        pagination={{
          showTotal(total: number) {
            return '总数:' + total;
          },
          pageSize: 10,
          total: total,
          onChange(page, pageSize) {
            loadData(page, pageSize);
          },
        }}
      />
    </PageContainer>
  );
};

export default Index;
