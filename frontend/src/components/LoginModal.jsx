import React from 'react';
import { Modal, List, Button } from 'antd';

const LoginModal = ({ visible, onCancel, persons, onLogin }) => {
  return (
    <Modal
      title="选择登录身份"
      open={visible}
      onCancel={onCancel}
      footer={null}
    >
      <List
        dataSource={persons}
        renderItem={(person) => (
          <List.Item
            actions={[<Button type="primary" onClick={() => onLogin(person)}>选择</Button>]}
          >
            <List.Item.Meta
              title={person.name}
              description={`部门: ${person.department}`}
            />
          </List.Item>
        )}
      />
    </Modal>
  );
};

export default LoginModal;
