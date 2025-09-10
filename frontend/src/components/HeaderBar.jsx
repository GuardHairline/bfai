import React from 'react';
import { Layout, Space, Typography, Select } from 'antd';

const { Header } = Layout;
const { Title } = Typography;

/**
 * HeaderBar displays the conversation title (project name or default)
 * and a model selection dropdown.  Changes to the selected model are
 * propagated via onModelChange.
 *
 * @param {Object|null} selectedTask - current selected task.
 * @param {string} selectedModel - current model key.
 * @param {Function} onModelChange - callback invoked when model changes.
 */
const HeaderBar = ({ selectedTask, selectedModel, onModelChange }) => {
  return (
    <Header
      style={{
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        padding: '0 16px',
      }}
    >
      <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4} style={{ margin: 0 }}>
          {selectedTask ? selectedTask.name : '新的会话'}
        </Title>
        <Select
          value={selectedModel}
          onChange={(value) => onModelChange(value)}
          style={{ width: 160 }}
          options={[
            { value: 'default-model', label: '默认模型' },
            { value: 'model-a', label: '模型A' },
            { value: 'model-b', label: '模型B' },
          ]}
        />
      </Space>
    </Header>
  );
};

export default HeaderBar;