import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Space } from 'antd';
import { EditOutlined, SaveOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = Select;

const BaselineWorkHoursTable = ({ data = [], onDataChange }) => {
  const [editingKey, setEditingKey] = useState('');
  const [tableData, setTableData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  // 当data prop变化时更新tableData
  useEffect(() => {
    setTableData(data || []);
  }, [data]);

  // 添加新行
  const handleAdd = () => {
    const newRow = {
      key: Date.now().toString(),
      serialNumber: tableData.length + 1,
      powerConfig: 'DE09（4B15E+DHT-3+PHEV+国内专属）',
      primaryTask: '',
      changeType: '',
      definitionScope: '',
      specificItem: '',
      baselineHours: 0,
      totalReportedHours: 0,
      month202507: 0,
      month202508: 0,
      isNew: true
    };
    setTableData([...tableData, newRow]);
    setIsEditing(true);
  };

  // 开始编辑
  const handleEdit = (record) => {
    setEditingKey(record.key);
    setIsEditing(true);
  };

  // 保存编辑
  const handleSave = (key) => {
    setEditingKey('');
    setIsEditing(false);
    if (onDataChange) {
      onDataChange(tableData);
    }
  };

  // 取消编辑
  const handleCancel = () => {
    setEditingKey('');
    setIsEditing(false);
  };

  // 删除行
  const handleDelete = (key) => {
    const newData = tableData.filter(item => item.key !== key);
    setTableData(newData);
    if (onDataChange) {
      onDataChange(newData);
    }
  };

  // 更新单元格数据
  const handleCellChange = (key, field, value) => {
    if (!key || !field) return;
    
    const newData = tableData.map(item => {
      if (item && item.key === key) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setTableData(newData);
  };

  // 可编辑单元格组件
  const EditableCell = ({ editing, dataIndex, title, record, children, ...restProps }) => {
    if (!record) {
      return <td {...restProps}>{children}</td>;
    }

    const input = dataIndex === 'changeType' ? (
      <Select
        value={record[dataIndex] || ''}
        onChange={(value) => handleCellChange(record.key, dataIndex, value)}
        style={{ width: '100%' }}
      >
        <Option value="借用">借用</Option>
        <Option value="小改">小改</Option>
        <Option value="全新">全新</Option>
      </Select>
    ) : (
      <Input
        value={record[dataIndex] || ''}
        onChange={(e) => handleCellChange(record.key, dataIndex, e.target.value)}
        type={dataIndex.includes('Hours') || dataIndex.includes('month') ? 'number' : 'text'}
      />
    );

    return (
      <td {...restProps}>
        {editing ? input : children}
      </td>
    );
  };

  const columns = [
    {
      title: '序号',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      width: 80,
      align: 'center',
      fixed: 'left',
    },
    {
      title: '动力配置',
      dataIndex: 'powerConfig',
      key: 'powerConfig',
      width: 200,
      ellipsis: true,
      onCell: (record) => ({
        record,
        dataIndex: 'powerConfig',
        title: '动力配置',
        editing: editingKey === record.key,
      }),
    },
    {
      title: '一级任务',
      dataIndex: 'primaryTask',
      key: 'primaryTask',
      width: 150,
      ellipsis: true,
      onCell: (record) => ({
        record,
        dataIndex: 'primaryTask',
        title: '一级任务',
        editing: editingKey === record.key,
      }),
    },
    {
      title: '改动类型',
      dataIndex: 'changeType',
      key: 'changeType',
      width: 100,
      ellipsis: true,
      onCell: (record) => ({
        record,
        dataIndex: 'changeType',
        title: '改动类型',
        editing: editingKey === record.key,
      }),
    },
    {
      title: '定义范围',
      dataIndex: 'definitionScope',
      key: 'definitionScope',
      width: 120,
      ellipsis: true,
      onCell: (record) => ({
        record,
        dataIndex: 'definitionScope',
        title: '定义范围',
        editing: editingKey === record.key,
      }),
    },
    {
      title: '具体事项',
      dataIndex: 'specificItem',
      key: 'specificItem',
      width: 150,
      ellipsis: true,
      onCell: (record) => ({
        record,
        dataIndex: 'specificItem',
        title: '具体事项',
        editing: editingKey === record.key,
      }),
    },
    {
      title: '基准工时',
      dataIndex: 'baselineHours',
      key: 'baselineHours',
      width: 100,
      align: 'right',
      onCell: (record) => ({
        record,
        dataIndex: 'baselineHours',
        title: '基准工时',
        editing: editingKey === record.key,
      }),
    },
    {
      title: '填报总工时',
      dataIndex: 'totalReportedHours',
      key: 'totalReportedHours',
      width: 120,
      align: 'right',
      onCell: (record) => ({
        record,
        dataIndex: 'totalReportedHours',
        title: '填报总工时',
        editing: editingKey === record.key,
      }),
    },
    {
      title: '202507',
      dataIndex: 'month202507',
      key: 'month202507',
      width: 80,
      align: 'right',
      onCell: (record) => ({
        record,
        dataIndex: 'month202507',
        title: '202507',
        editing: editingKey === record.key,
      }),
    },
    {
      title: '202508',
      dataIndex: 'month202508',
      key: 'month202508',
      width: 80,
      align: 'right',
      onCell: (record) => ({
        record,
        dataIndex: 'month202508',
        title: '202508',
        editing: editingKey === record.key,
      }),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      align: 'center',
      fixed: 'right',
      render: (_, record) => {
        if (!record) return null;
        const isEditing = editingKey === record.key;
        return (
          <Space size="small">
            {isEditing ? (
              <>
                <Button
                  type="link"
                  size="small"
                  icon={<SaveOutlined />}
                  onClick={() => handleSave(record.key)}
                >
                  保存
                </Button>
                <Button
                  type="link"
                  size="small"
                  onClick={handleCancel}
                >
                  取消
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                  disabled={isEditing}
                >
                  编辑
                </Button>
                <Button
                  type="link"
                  size="small"
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() => handleDelete(record.key)}
                >
                  删除
                </Button>
              </>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ marginTop: '16px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h3 style={{ margin: 0 }}>基准任务工时及月度明细表</h3>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            disabled={isEditing}
          >
            添加行
          </Button>
          <Button
            type="default"
            icon={<EditOutlined />}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? '完成编辑' : '编辑'}
          </Button>
        </Space>
      </div>
      
      <div style={{ 
        border: '1px solid #d9d9d9', 
        borderRadius: '6px',
        overflow: 'hidden'
      }}>
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={false}
          scroll={{ x: 1400, y: 400 }}
          size="small"
          bordered={false}
          rowKey="key"
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          style={{ margin: 0 }}
        />
      </div>
    </div>
  );
};

export default BaselineWorkHoursTable;
