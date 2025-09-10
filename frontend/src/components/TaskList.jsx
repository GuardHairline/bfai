import React from 'react';
import { Button } from 'antd';
import { ProTable } from '@ant-design/pro-components';

/**
 * TaskList renders a table of pending measurement tasks.  Each row
 * includes a "测算" action.  When the button is clicked the
 * provided onSelect callback is invoked with the selected task.
 *
 * @param {Object[]} tasks - array of task objects with id, name,
 *   department, calculator, brand, and spec.
 * @param {Function} onSelect - callback receiving the clicked task.
 */
const TaskList = ({ tasks, onSelect }) => {
  const columns = [
    { title: '项目名称', dataIndex: 'name' },
    { title: '部门', dataIndex: 'department' },
    { title: '测算人', dataIndex: 'calculator' },
    { title: '品牌', dataIndex: 'brand' },
    { title: '开发规格', dataIndex: 'spec' },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => {
        return [
          <Button type="link" key="measure" onClick={() => onSelect(record)}>
            测算
          </Button>,
        ];
      },
    },
  ];
  return (
    <ProTable
      rowKey="id"
      dataSource={tasks}
      columns={columns}
      search={false}
      options={false}
      pagination={false}
    />
  );
};

export default TaskList;