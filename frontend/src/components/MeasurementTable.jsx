import React, { useMemo, useState } from 'react';
import { Table, Input, InputNumber, Button, Space, Popconfirm, message } from 'antd';
import PropTypes from 'prop-types';

const HistoricalDetailsTable = ({ tableData, dynamicColumns, loading }) => {
  // Local editable state
  const [dataSource, setDataSource] = useState(() => Array.isArray(tableData) ? tableData : []);
  const [editingKey, setEditingKey] = useState(null);
  const [editingValues, setEditingValues] = useState({});

  // Sync local state when incoming data changes
  React.useEffect(() => {
    setDataSource(Array.isArray(tableData) ? tableData : []);
    setEditingKey(null);
    setEditingValues({});
  }, [tableData]);

  const getRowKey = (record, index) => record?.id ?? record?.['序号'] ?? index;
  const isEditing = (record, index) => editingKey === getRowKey(record, index);

  const staticColumns = [
    { title: '序号', dataIndex: '序号', key: '序号', width: 60 },
    { title: '动力配置', dataIndex: '动力配置', key: '动力配置', width: 150 },
    { title: '一级任务', dataIndex: '一级任务', key: '一级任务', width: 100 },
    { title: '改动类型', dataIndex: '改动类型', key: '改动类型', width: 100 },
    { title: '定义范围', dataIndex: '定义范围', key: '定义范围', width: 100 },
    { title: '具体事项', dataIndex: '具体事项', key: '具体事项', width: 200 },
    { title: '基准工时', dataIndex: '基准工时', key: '基准工时', width: 100 },
    { title: '填报总工时', dataIndex: '填报总工时', key: '填报总工时', width: 80 },
  ];

  const editableFields = new Set([
    '具体事项',
    '基准工时',
    '填报总工时',
    // dynamic month fields appended below
  ]);

  const monthColumns = (dynamicColumns || []).map(month => {
    editableFields.add(month);
    return {
      title: month,
      dataIndex: month,
      key: month,
      width: 80,
      render: (value, record, index) =>
        isEditing(record, index) ? (
          <InputNumber
            value={editingValues[month]}
            onChange={(v) => setEditingValues(prev => ({ ...prev, [month]: v }))}
            style={{ width: '100%' }}
            min={0}
          />
        ) : (
          value
        ),
    };
  });

  const baseColumns = staticColumns.map(col => {
    if (!editableFields.has(col.dataIndex)) {
      return col;
    }
    if (col.dataIndex === '具体事项') {
      return {
        ...col,
        render: (value, record, index) =>
          isEditing(record, index) ? (
            <Input
              value={editingValues['具体事项']}
              onChange={(e) => setEditingValues(prev => ({ ...prev, ['具体事项']: e.target.value }))}
            />
          ) : (
            value
          ),
      };
    }
    // numeric fields
    return {
      ...col,
      render: (value, record, index) =>
        isEditing(record, index) ? (
          <InputNumber
            value={editingValues[col.dataIndex]}
            onChange={(v) => setEditingValues(prev => ({ ...prev, [col.dataIndex]: v }))}
            style={{ width: '100%' }}
            min={0}
          />
        ) : (
          value
        ),
    };
  });

  const handleEdit = (record, index) => {
    const key = getRowKey(record, index);
    setEditingKey(key);
    // initialize editing values from record for editable fields
    const init = {};
    editableFields.forEach(field => {
      init[field] = record?.[field];
    });
    setEditingValues(init);
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditingValues({});
  };

  const handleSave = (record, index) => {
    const key = getRowKey(record, index);
    setDataSource(prev => prev.map((row, i) => (getRowKey(row, i) === key ? { ...row, ...editingValues } : row)));
    setEditingKey(null);
    setEditingValues({});
    message.success('已保存');
  };

  const handleDelete = (record, index) => {
    const key = getRowKey(record, index);
    setDataSource(prev => prev.filter((row, i) => getRowKey(row, i) !== key));
    message.success('已删除');
  };

  const actionColumn = useMemo(() => ({
    title: '操作',
    key: 'action',
    fixed: 'right',
    width: 140,
    render: (_v, record, index) => {
      const editing = isEditing(record, index);
      return (
        <Space>
          {editing ? (
            <>
              <Button type="link" onClick={() => handleSave(record, index)}>保存</Button>
              <Button type="link" onClick={handleCancel}>取消</Button>
            </>
          ) : (
            <Button type="link" onClick={() => handleEdit(record, index)}>编辑</Button>
          )}
          <Popconfirm title="确认删除该行？" onConfirm={() => handleDelete(record, index)}>
            <Button type="link" danger>删除</Button>
          </Popconfirm>
        </Space>
      );
    },
  }), [editingKey, editingValues]);

  const columns = [...baseColumns, ...monthColumns, actionColumn];

  return (
    <div style={{ marginTop: '20px', width: '100%', overflowX: 'auto' }}>
      <Table 
        columns={columns} 
        dataSource={dataSource} 
        loading={loading} 
        rowKey={getRowKey}
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
