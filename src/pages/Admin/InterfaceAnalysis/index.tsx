import { PageContainer } from '@ant-design/pro-components';
import ReactECharts from 'echarts-for-react';
import '@umijs/max'
import React, {useEffect, useState} from 'react';
import {listTopInvokeInterfaceInfoUsingGet} from "@/services/lengapi-backend/analysisController";

/**
 * 接口分析
 * @constructor
 */
const InterfaceAnalysis: React.FC = () => {

  const [data, setDate] = useState<API.InterfaceInfoVO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('111');
    setLoading(true);
    listTopInvokeInterfaceInfoUsingGet()
      .then(res => {
        console.log('222:', res.data);
        if (res.data) {
          setDate(res.data);
        }
      })
      .catch(e => {
        console.error('获取接口数据失败', e);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 映射: { value: 1048, name: 'Search Engine' }
  // 添加数据检查和默认值
  const chartData = data?.map(item => ({
    value: item.totalNum || 0,  // 确保有数值，默认为0
    name: item.name || '未知接口'  // 确保有名称，默认为"未知接口"
  })) || [];  // 如果data为空，返回空数组

  // 添加数据检查
  console.log('原始数据:', data);
  console.log('处理后的图表数据:', chartData);


  const option = {
    title: {
      text: '调用最多的接口TOP3',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: 'Access From',
        type: 'pie',
        radius: '50%',
        data: chartData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
  return (
    <PageContainer>
      <ReactECharts loadingOption={{
        showLoading: loading
      }} option={option} />
    </PageContainer>
  );
};
export default InterfaceAnalysis;
