import React, { useMemo, useState } from 'react';
import { Table, Input, InputNumber, Button, Space, Popconfirm, message, Modal } from 'antd';
import PropTypes from 'prop-types';
import BaselineBusinessModal from './BaselineBusinessModal';
import { useAnimatedRows } from '../hooks/useAnimatedRows';

const MeasurementTable = ({ tableData, dynamicColumns, loading, onSubmit }) => {
  // Local editable state
  const [dataSource, setDataSource] = useState([]);
  const [editingKey, setEditingKey] = useState(null);
  const [editingValues, setEditingValues] = useState({});
  const [newRowCounter, setNewRowCounter] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Sync local state when incoming data changes
  React.useEffect(() => {
    const initialData = (Array.isArray(tableData) ? tableData : []).map((row, index) => ({
      ...row,
      key: row?.id ?? row?.['序号'] ?? `row_${index}`
    }));
    setDataSource(initialData);
    setEditingKey(null);
    setEditingValues({});
  }, [tableData]);

  const animatedDataSource = useAnimatedRows(dataSource);

  const getRowKey = (record, index) => record.key ?? record?.id ?? record?.['序号'] ?? index;
  const isEditing = (record, index) => editingKey === getRowKey(record, index);

  const staticColumns = [
    { title: '序号', dataIndex: '序号', key: '序号', width: 60 },
    { title: '动力配置', dataIndex: '动力配置', key: '动力配置', width: 150 },
    { title: '一级任务', dataIndex: '一级任务', key: '一级任务', width: 100 },
    { title: '改动类型', dataIndex: '改动类型', key: '改动类型', width: 100 },
    { title: '定义范围', dataIndex: '定义范围', key: '定义范围', width: 100 },
    { title: '具体事项', dataIndex: '具体事项', key: '具体事项', width: 200 },
    { title: '基准工时', dataIndex: '基准工时', key: '基准工时', width: 100 },
    {
      title: '填报总工时',
      dataIndex: '填报总工时',
      key: '填报总工时',
      width: 80,
      render: (text, record, index) => {
        if (isEditing(record, index)) {
          return editingValues['填报总工时'];
        }
        const total = (dynamicColumns || []).reduce((sum, month) => sum + (Number(record[month]) || 0), 0);
        return total;
      },
    },
  ];

  const editableFields = new Set([
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
            onChange={(v) => {
              setEditingValues(prev => {
                const newValues = { ...prev, [month]: v };
                const total = (dynamicColumns || []).reduce((sum, m) => sum + (Number(newValues[m]) || 0), 0);
                return { ...newValues, '填报总工时': total };
              });
            }}
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
    const total = (dynamicColumns || []).reduce((sum, month) => sum + (Number(record[month]) || 0), 0);
    init['填报总工时'] = total;
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

  const handleModalOk = (selectedItems) => {
    const newRows = selectedItems.map((item, index) => {
      const key = `new_${newRowCounter + index}`;
      const newRow = {
        ...item,
        key,
        '序号': dataSource.length + index + 1,
        '填报总工时': 0,
      };
      (dynamicColumns || []).forEach(month => {
        newRow[month] = 0;
      });
      return newRow;
    });

    setDataSource(prev => [...prev, ...newRows]);
    setNewRowCounter(c => c + newRows.length);
    setIsModalVisible(false);
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

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(dataSource);
    }
    Modal.success({
      title: '提交完成',
      content: '数据已提交。',
      okText: '知道了',
    });
  };

  return (
    <div style={{ marginTop: '20px', width: '100%', overflowX: 'auto' }}>
      <Button onClick={() => setIsModalVisible(true)} type="primary" style={{ marginBottom: 16 }}>
        新增业务
      </Button>
      <Table 
        columns={columns} 
        dataSource={animatedDataSource} 
        loading={loading} 
        rowKey={getRowKey}
        scroll={{ x: 'max-content' }}
        pagination={{ pageSize: 10 }}
        bordered
      />
      <div style={{ marginTop: '16px', textAlign: 'right' }}>
        <Button type="primary" onClick={handleSubmit}>
          提交
        </Button>
      </div>
      <BaselineBusinessModal
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleModalOk}
      />
    </div>
  );
};

MeasurementTable.propTypes = {
  tableData: PropTypes.array.isRequired,
  dynamicColumns: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func,
};

export default MeasurementTable;
