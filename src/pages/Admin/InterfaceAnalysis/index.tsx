import {
  getAllInterfacesInvokeCountUsingGet,
  getTop3InterfaceInvokeInfoUsingGet,
} from '@/services/lengapi-backend/analysisController';
import { PageContainer } from '@ant-design/pro-components';
import '@umijs/max';
import ReactECharts from 'echarts-for-react';
import React, { useEffect, useState } from 'react';

/**
 * 接口分析
 * @constructor
 */
const InterfaceAnalysis: React.FC = () => {
  // TOP3接口数据状态
  const [top3Data, setTop3Data] = useState<API.InterfaceInfoVO[]>([]);
  const [top3Loading, setTop3Loading] = useState(true);

  // 所有接口数据状态
  const [allData, setAllData] = useState<API.InterfaceInfoVO[]>([]);
  const [allLoading, setAllLoading] = useState(true);

  useEffect(() => {
    // 获取TOP3接口数据
    setTop3Loading(true);
    getTop3InterfaceInvokeInfoUsingGet()
      .then((res) => {
        if (res.data) {
          setTop3Data(res.data);
        }
      })
      .catch((e) => {
        console.error('获取TOP3接口数据失败', e);
      })
      .finally(() => {
        setTop3Loading(false);
      });

    // 获取所有接口数据
    setAllLoading(true);
    getAllInterfacesInvokeCountUsingGet() // 假设新增了这个API
      .then((res) => {
        if (res.data) {
          setAllData(res.data);
        }
      })
      .catch((e) => {
        console.error('获取所有接口数据失败', e);
      })
      .finally(() => {
        setAllLoading(false);
      });
  }, []);

  // 处理TOP3图表数据
  const top3ChartData =
    top3Data?.map((item) => ({
      value: item.interfaceTotal || 0,
      name: item.name || '未知接口',
    })) || [];

  // 处理所有接口图表数据
  const allChartData =
    allData?.map((item) => ({
      value: item.interfaceTotal || 0,
      name: item.name || '未知接口',
    })) || [];

  // TOP3图表配置
  const top3Option = {
    title: {
      text: '调用最多的接口TOP3',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: top3ChartData.map((item) => item.name),
    },
    series: [
      {
        name: '调用次数',
        type: 'pie',
        radius: '50%',
        data: top3ChartData,
        label: {
          show: true,
          formatter: '{b}: {c} ({d}%)',
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  // 所有接口图表配置
  const allOption = {
    title: {
      text: '所有接口调用次数统计',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: allChartData.map((item) => item.name),
    },
    series: [
      {
        name: '调用次数',
        type: 'pie',
        radius: '50%',
        data: allChartData,
        label: {
          show: true,
          formatter: '{b}: {c} ({d}%)',
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  return (
    <PageContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        {/* 左侧TOP3饼图 */}
        <ReactECharts
          style={{ width: '48%', height: '400px' }}
          loadingOption={{ showLoading: top3Loading }}
          option={top3Option}
        />

        {/* 右侧所有接口饼图 */}
        <ReactECharts
          style={{ width: '48%', height: '400px' }}
          loadingOption={{ showLoading: allLoading }}
          option={allOption}
        />
      </div>
    </PageContainer>
  );
};

export default InterfaceAnalysis;
