import type { ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Modal } from 'antd';
import React, { useEffect, useRef } from 'react';

export type Props = {
  values: API.InterfaceInfo;
  columns: ProColumns<API.InterfaceInfo>[]; // 确保这里的类型正确
  onCancel: () => void;
  onSubmit: (values: API.InterfaceInfo) => Promise<void>;
  open: boolean;
};

const UpdateModal: React.FC<Props> = (props) => {
  const { values, columns, onCancel, onSubmit, open } = props;

  const formRef = useRef<ProFormInstance>();

  useEffect(() => {
    if (formRef.current && values) {
      formRef.current?.setFieldsValue(values);
    }
  }, [values]); // 确保依赖项正确

  return (
    <Modal
      open={open}
      footer={null}
      onCancel={() => {
        onCancel?.();
      }}
    >
      <ProTable
        type="form"
        formRef={formRef}
        columns={columns}
        onSubmit={async (value) => {
          onSubmit?.(value as API.InterfaceInfo);
        }}
      />
    </Modal>
  );
};

export default UpdateModal;
