import React, { useState } from 'react';
import { Button, Typography, Space, Popconfirm, message } from 'antd';
import { EditableProTable } from '@ant-design/pro-components';

const { Paragraph } = Typography;

/**
 * BaselineDetails displays selected baseline tasks in an editable table
 * with summary information.  Initially, the table is read-only; clicking
 * the "编辑" button toggles editing mode, allowing inline changes.
 * After editing, clicking "完成编辑" saves the changes.  A submit
 * button triggers the onSubmit callback.
 *
 * @param {number[]} baselineIds - list of selected baseline IDs.
 * @param {Object[]} baselines - full baseline dataset to resolve IDs.
 * @param {Function} onSubmit - callback invoked when submitting results.
 */
const BaselineDetails = ({ baselineIds, baselines, onSubmit }) => {
  // Build initial data source by cloning selected baseline entries.
  const [dataSource, setDataSource] = useState(() =>
    baselineIds
      .map((id) => baselines.find((b) => b.id === id))
      .filter(Boolean)
      .map((item) => ({ ...item })),
  );
  const [editableKeys, setEditableKeys] = useState([]);

  // Summary calculations: total hours, unique power configurations,
  // and months grouped by configuration.
  const totalHours = dataSource.reduce((sum, item) => sum + (item?.hours || 0), 0);
  const configSet = new Set();
  const configMonths = {};
  dataSource.forEach((item) => {
    if (!item) return;
    const cfg = item.powerConfig;
    configSet.add(cfg);
    configMonths[cfg] = (configMonths[cfg] || 0) + (item.months || 0);
  });

  const handleDelete = (row) => {
    setDataSource(prev => prev.filter(item => item.id !== row.id));
    message.success('已删除该行');
  };

  const columns = [
    { title: '序号', dataIndex: 'id', editable: false },
    { title: '动力配置', dataIndex: 'powerConfig' },
    { title: '一级任务', dataIndex: 'name' },
    { title: '改动类型', dataIndex: 'type' },
    { title: '具体事项', dataIndex: 'matter' },
    { title: '工时', dataIndex: 'hours' },
    { title: '月数', dataIndex: 'months' },
    {
      title: '操作',
      valueType: 'option',
      width: 140,
      render: (text, row) => {
        const isEditing = editableKeys.includes(row.id);
        return (
          <Space>
            {isEditing ? (
              <Button type="link" onClick={() => setEditableKeys(keys => keys.filter(k => k !== row.id))}>完成</Button>
            ) : (
              <Button type="link" onClick={() => setEditableKeys(keys => Array.from(new Set([...keys, row.id])))}>编辑</Button>
            )}
            <Popconfirm title="确认删除该行？" onConfirm={() => handleDelete(row)}>
              <Button type="link" danger>删除</Button>
            </Popconfirm>
          </Space>
        );
      }
    },
  ];

  return (
    <div>
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <EditableProTable
          rowKey="id"
          value={dataSource}
          columns={columns}
          recordCreatorProps={false}
          pagination={false}
          scroll={{ x: 'max-content' }}
          editable={{
            editableKeys,
            onChange: setEditableKeys,
            onSave: async (rowKey, data, row) => {
              setDataSource((prev) => prev.map((item) => (item.id === rowKey ? { ...row } : item)));
              setEditableKeys(keys => keys.filter(k => k !== rowKey));
              message.success('已保存');
            },
            type: 'multiple',
          }}
        />
      </div>
      <Paragraph style={{ marginTop: 16 }}>
        共查询到 {dataSource.length} 条基准任务工时记录；总目标工时合计:{totalHours}
        工时；动力配置总数: {configSet.size} 种；日程月数:
        {Object.entries(configMonths)
          .map(([cfg, months]) => `${cfg}${months}个月`)
          .join('，')}
        。
      </Paragraph>
      <Button type="primary" onClick={() => onSubmit()}>提交测算结果</Button>
    </div>
  );
};

export default BaselineDetails;