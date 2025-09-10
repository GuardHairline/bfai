import React from 'react';
import { ProDescriptions } from '@ant-design/pro-components';

/**
 * ProjectInfo displays the basic information of a project.  The data
 * source should contain fields matching the column definitions.
 *
 * @param {Object} project - details about the selected project.
 */
const ProjectInfo = ({ project }) => {
  const columns = [
    { title: '项目ID', dataIndex: 'projectId' },
    { title: '项目名称', dataIndex: 'projectName' },
    { title: '部门', dataIndex: 'department' },
    { title: '品牌', dataIndex: 'brand' },
    { title: '开发规模(SML)', dataIndex: 'scale' },
    { title: '测算状态', dataIndex: 'status' },
    { title: '测算人', dataIndex: 'calculator' },
    { title: '创建时间', dataIndex: 'createdAt' },
    { title: '更新时间', dataIndex: 'updatedAt' },
    { title: '订单信息', dataIndex: 'orderInfo' },
    { title: '动力配置', dataIndex: 'powerConfig' },
  ];
  return (
    <ProDescriptions
      title="项目基础信息"
      dataSource={project}
      columns={columns}
      column={1}
      bordered
      size="small"
      style={{ marginBottom: 16 }}
    />
  );
};

export default ProjectInfo;