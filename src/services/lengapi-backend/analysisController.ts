// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** getAllInterfacesInvokeCount GET /api/Analysis/all/interfaces/invoke/count */
export async function getAllInterfacesInvokeCountUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseListInterfaceInfoVO_>(
    '/api/Analysis/all/interfaces/invoke/count',
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

/** getTop3InterfaceInvokeInfo GET /api/Analysis/top3/interface/invoke */
export async function getTop3InterfaceInvokeInfoUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseListInterfaceInfoVO_>('/api/Analysis/top3/interface/invoke', {
    method: 'GET',
    ...(options || {}),
  });
}
