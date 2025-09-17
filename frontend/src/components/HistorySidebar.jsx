import React from 'react';
import { Button, List, Typography } from 'antd';

const { Title } = Typography;

/**
 * HistorySidebar renders the left panel containing conversation history,
 * measurement history, a new conversation button, and a login/logout
 * toggle. It accepts callbacks for starting new conversations and
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
      <div>
        <Title level={5}>对话历史</Title>
        <Button type="primary" size="small" style={{ marginBottom: 8 }} onClick={onNewConversation}>
          新建会话
        </Button>
      </div>
      {/* 对话历史列表容器，设置固定高度和滚动条 */}
      <div style={{ height: '30%', overflowY: 'auto', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>
        <List
          dataSource={conversationHistory}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta title={item.title} description={item.timestamp} />
            </List.Item>
          )}
        />
      </div>
      
      <div style={{ marginTop: '16px' }}>
        <Title level={5}>测算历史</Title>
      </div>
      {/* 测算历史列表容器，占据剩余空间并可滚动 */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <List
          dataSource={measurementHistory}
          renderItem={(item) => (
            <List.Item
              style={{ cursor: 'pointer', display: 'block', padding: '8px 0' }}
              onClick={() => onHistorySelect(item)}
            >
              <Typography.Text strong>{item.name}</Typography.Text>
              <div>
                <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                  测算人: {item.calculator}
                </Typography.Text>
              </div>
              <div>
                <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                  部门: {item.department}
                </Typography.Text>
              </div>
            </List.Item>
          )}
        />
      </div>
      
      {/* 登录按钮固定在底部 */}
      <div style={{ paddingTop: '16px', textAlign: 'center' }}>
        <Button onClick={onToggleLogin}>{loggedIn ? '退出登录' : '登录'}</Button>
      </div>
    </div>
  );
};

export default HistorySidebar;