import React from 'react';
import { Button } from 'antd';
import { ProTable } from '@ant-design/pro-components';

/**
 * BaselineList renders a table of available baseline tasks and allows
 * the user to select multiple entries via checkboxes.  A submit
 * button triggers the onSubmit callback.  The selected row keys
 * are managed externally.
 *
 * @param {Object[]} baselines - array of baseline tasks.
 * @param {number[]} selectedIds - array of selected baseline IDs.
 * @param {Function} onChange - invoked with updated selected IDs.
 * @param {Function} onSubmit - invoked when the user confirms selection.
 */
const BaselineList = ({ baselines, selectedIds, onChange, onSubmit }) => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '动力配置', dataIndex: 'powerConfig' },
    { title: '一级任务', dataIndex: 'name' },
    { title: '改动类型', dataIndex: 'type' },
    { title: '具体事项', dataIndex: 'matter' },
  ];
  return (
    <div>
      <ProTable
        rowKey="id"
        dataSource={baselines}
        columns={columns}
        search={false}
        options={false}
        pagination={false}
        rowSelection={{
          selectedRowKeys: selectedIds,
          onChange: (keys) => onChange(keys),
        }}
      />
      <div style={{ marginTop: 16 }}>
        <Button
          type="primary"
          onClick={() => onSubmit()}
          disabled={selectedIds.length === 0}
        >
          提交测算结果
        </Button>
      </div>
    </div>
  );
};

export default BaselineList;