import React from 'react';
import { ProChat } from '@ant-design/pro-chat';

/**
 * ChatArea wraps the ProChat component.  It accepts the current
 * conversation messages, a change handler for when chats update, a
 * contentRender function to customize message rendering, and a
 * request function used by ProChat when interacting with a backend.
 *
 * @param {Object[]} chats - list of message objects for ProChat.
 * @param {Function} onChatsChange - invoked when messages change.
 * @param {Function} contentRender - custom render function for chat items.
 * @param {Function} request - callback used by ProChat to fetch assistant responses.
 */
const ChatArea = ({ chats, onChatsChange, contentRender, request }) => {
  return (
    <ProChat
      chats={chats}
      onChatsChange={onChatsChange}
      chatItemRenderConfig={{ contentRender }}
      request={request}
      style={{ height: '100%' }}
    />
  );
};

export default ChatArea;