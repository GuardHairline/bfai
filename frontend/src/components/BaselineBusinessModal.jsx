import React, { useState, useEffect } from 'react';
import { Modal, Table, Button } from 'antd';
import PropTypes from 'prop-types';
import { fetchBaselines } from '../services/api'; // 引入新的 API 函数

const BaselineBusinessModal = ({ visible, onCancel, onOk }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [baselines, setBaselines] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setLoading(true);
      fetchBaselines()
        .then(data => {
          setBaselines(data);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [visible]);

  const columns = [
    { title: '动力配置', dataIndex: '动力配置', key: '动力配置' },
    { title: '一级任务', dataIndex: '一级任务', key: '一级任务' },
    { title: '改动类型', dataIndex: '改动类型', key: '改动类型' },
    { title: '定义范围', dataIndex: '定义范围', key: '定义范围' },
    { title: '具体事项', dataIndex: '具体事项', key: '具体事项' },
    { title: '基准工时', dataIndex: '基准工时', key: '基准工时' },
  ];

  const handleOk = () => {
    const selectedItems = baselines.filter(item => selectedRowKeys.includes(item.id));
    onOk(selectedItems);
    setSelectedRowKeys([]);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  return (
    <Modal
      title="选择基准业务"
      visible={visible}
      onCancel={onCancel}
      width={1000}
      footer={[
        <Button key="back" onClick={onCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk}>
          确定
        </Button>,
      ]}
    >
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={baselines}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />
    </Modal>
  );
};

BaselineBusinessModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
};

export default BaselineBusinessModal;
