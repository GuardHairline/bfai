import React from 'react';
import { Table, Button, Card } from 'antd';

const TaskDetails = ({ details, onContinue }) => {
  if (!details) {
    return <Card bordered={false}>加载任务详情中...</Card>;
  }

  const columns = [
    {
      title: '字段',
      dataIndex: 'label',
      key: 'label',
      width: '30%', // 恢复常规比例
      render: (text) => <strong>{text}</strong>,
      onCell: () => ({
        style: {
          background: '#fafafa',
        },
      }),
    },
    {
      title: '值',
      dataIndex: 'value',
      key: 'value',
      width: '70%', // 恢复常规比例
    },
  ];

  const data = [
    { key: '1', label: '项目ID', value: details.projectId },
    { key: '2', label: '项目名称', value: details.projectName },
    { key: '3', label: '部门', value: details.department },
    { key: '4', label: '品牌', value: details.brand },
    { key: '5', label: '开发规模 (SML)', value: details.scale },
    { key: '6', label: '测算状态', value: details.status },
    { key: '7', label: '测算人', value: details.calculator },
    { key: '8', label: '创建时间', value: details.createdAt },
    { key: '9', label: '更新时间', value: details.updatedAt },
    { key: '10', label: '订单信息', value: details.orderInfo },
    { key: '11', label: '动力配置', value: details.powerConfig },
  ];

  return (
    <Card bordered={false} bodyStyle={{ padding: 0 }}>
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        bordered
        showHeader={false}
        size="small"
        style={{ width: '100%', minWidth: '500px' }}
      />
      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <Button type="primary" onClick={onContinue}>
          继续测算
        </Button>
      </div>
    </Card>
  );
};

export default TaskDetails;
