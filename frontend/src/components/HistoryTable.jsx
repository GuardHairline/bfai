import React from 'react';
import { Button } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import { useAnimatedRows } from '../hooks/useAnimatedRows';

/**
 * HistoryTable renders a list of historical measurement records.  Each
 * row contains a "参考并测算" button that invokes the onReference
 * callback with the selected record.  Used to quickly apply
 * historical strategies.
 *
 * @param {Object[]} history - array of records with id, name,
 *   department, calculator, brand, spec and strategyId fields.
 * @param {Function} onReference - callback receiving the clicked record.
 */
const HistoryTable = ({ history, onReference }) => {
  const animatedHistory = useAnimatedRows(history);
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
          <Button type="link" key="reference" onClick={() => onReference(record)}>
            参考并测算
          </Button>,
        ];
      },
    },
  ];
  return (
    <ProTable
      rowKey="id"
      dataSource={animatedHistory}
      columns={columns}
      search={false}
      options={false}
      pagination={false}
    />
  );
};

export default HistoryTable;