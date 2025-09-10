import React from 'react';
import { Button, List, Typography } from 'antd';

const { Title } = Typography;

/**
 * HistorySidebar renders the left panel containing conversation history,
 * measurement history, a new conversation button, and a login/logout
 * toggle.  It accepts callbacks for starting new conversations and
 * selecting history records.
 *
 * @param {Object[]} conversationHistory - array of objects with title and timestamp.
 * @param {Object[]} measurementHistory - array of records with title and baselineIds.
 * @param {Function} onNewConversation - called when the user clicks "新建会话".
 * @param {Function} onHistorySelect - called with a history record when clicked.
 * @param {boolean} loggedIn - current login state.
 * @param {Function} onToggleLogin - toggles login state.
 */
const HistorySidebar = ({
  conversationHistory,
  measurementHistory,
  onNewConversation,
  onHistorySelect,
  loggedIn,
  onToggleLogin,
}) => {
  return (
    <div
      style={{
        background: '#fff',
        borderRight: '1px solid #f0f0f0',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Title level={5}>对话历史</Title>
      <Button type="primary" size="small" style={{ marginBottom: 8 }} onClick={onNewConversation}>
        新建会话
      </Button>
      <List
        size="small"
        dataSource={conversationHistory}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta title={item.title} description={item.timestamp} />
          </List.Item>
        )}
      />
      <Title level={5} style={{ marginTop: 24 }}>测算历史</Title>
      <List
        size="small"
        dataSource={measurementHistory}
        renderItem={(item) => (
          <List.Item style={{ cursor: 'pointer' }} onClick={() => onHistorySelect(item)}>
            <List.Item.Meta title={item.title} description={item.baseline?.join('，')} />
          </List.Item>
        )}
      />
      <div style={{ marginTop: 'auto', textAlign: 'center' }}>
        <Button onClick={onToggleLogin}>{loggedIn ? '退出登录' : '登录'}</Button>
      </div>
    </div>
  );
};

export default HistorySidebar;