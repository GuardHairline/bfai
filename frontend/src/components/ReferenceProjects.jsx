import React from 'react';
import { Table, Button, Tag, Space } from 'antd';
import PropTypes from 'prop-types';

const ReferenceProjects = ({ projects, loading }) => {
  const columns = [
    {
      title: '项目名称',
      dataIndex: 'projectName',
      key: 'projectName',
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: '测算人',
      dataIndex: 'calculator',
      key: 'calculator',
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      key: 'brand',
      render: brand => <Tag color="blue">{brand}</Tag>,
    },
    {
      title: '开发规格',
      dataIndex: 'spec',
      key: 'spec',
      render: spec => <Tag color="geekblue">{spec}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <Space size="middle">
          <Button type="primary" onClick={() => console.log('Referencing project:', record.id)}>
            参考并测算
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>历史测算项目参考：</h3>
      <Table 
        columns={columns} 
        dataSource={projects} 
        loading={loading} 
        rowKey="id" 
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
};

ReferenceProjects.propTypes = {
  projects: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default ReferenceProjects;
