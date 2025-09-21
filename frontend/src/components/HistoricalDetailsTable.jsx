import React from 'react';
import { Table, Button, Space } from 'antd';
import PropTypes from 'prop-types';

const HistoricalDetailsTable = ({ tableData, dynamicColumns, loading }) => {
  const staticColumns = [
    { title: '序号', dataIndex: '序号', key: '序号', width: 60 },
    { title: '动力配置', dataIndex: '动力配置', key: '动力配置', width: 150 },
    { title: '一级任务', dataIndex: '一级任务', key: '一级任务', width: 100 },
    { title: '改动类型', dataIndex: '改动类型', key: '改动类型', width: 100 },
    { title: '定义范围', dataIndex: '定义范围', key: '定义范围', width: 100 },
    { title: '具体事项', dataIndex: '具体事项', key: '具体事项', width: 250 },
    { title: '基准工时', dataIndex: '基准工时', key: '基准工时', width: 100 },
    { title: '填报总工时', dataIndex: '填报总工时', key: '填报总工时', width: 120 },
  ];

  const monthColumns = dynamicColumns.map(month => ({
    title: month,
    dataIndex: month,
    key: month,
    width: 100,
  }));

  const actionColumn = {
    title: '操作',
    key: 'action',
    fixed: 'right',
    width: 120,
    render: (text, record) => (
      <Space size="middle">
        <Button type="primary" onClick={() => console.log('Referencing item:', record.id)}>
          参考并测算
        </Button>
      </Space>
    ),
  };

  const columns = [...staticColumns, ...monthColumns, actionColumn];

  return (
    <div style={{ marginTop: '20px', width: '100%' }}>
      <Table 
        columns={columns} 
        dataSource={tableData} 
        loading={loading} 
        rowKey="id"
        scroll={{ x: 'max-content' }}
        pagination={{ pageSize: 10 }}
        bordered
      />
    </div>
  );
};

HistoricalDetailsTable.propTypes = {
  tableData: PropTypes.array.isRequired,
  dynamicColumns: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default HistoricalDetailsTable;
