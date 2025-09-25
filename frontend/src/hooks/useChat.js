import { useState, useCallback } from 'react';
import { streamChatResponse, fetchHistoricalProjectDetails } from '../services/api';

export const useChat = () => {
  const [chats, setChats] = useState([]);

  const pushMessages = useCallback((messages) => {
    setChats((prev) => [
      ...prev,
      ...messages.map((msg) => ({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        createAt: Date.now(),
        role: msg.role,
        content: msg.content === undefined ? '' : msg.content,
        ...msg,
      })),
    ]);
  }, []);

  const startNewConversationMessages = useCallback((loggedInUser) => {
    if (loggedInUser) {
      pushMessages([
        { role: 'assistant', content: '请选择需要进行的操作：' },
        { role: 'measurement-entry', content: null },
      ]);
    } else {
      pushMessages([
        { role: 'assistant', content: '欢迎使用业财一体化智能测算助手，请先登录。' },
      ]);
    }
  }, [pushMessages]);

  const viewHistoryRecordMessages = useCallback((record) => {
    pushMessages([
      { role: 'assistant', content: `您查看了历史测算记录：${record.name}` },
    ]);
  }, [pushMessages]);


  // 在聊天中渲染测算表格
  const generateMeasurementTable = useCallback(async (projectId, projectName) => {
    if (!projectId) return;
    try {
      const data = await fetchHistoricalProjectDetails(projectId);
      const tableData = data?.table_data || [];
      const dynamicColumns = data?.dynamic_columns || [];
      pushMessages([
        { role: 'assistant', content: '思考中' },
        { role: 'assistant', content: '已思考' },
        { role: 'assistant', content: `以下为“${projectName || ''}”的基准任务工时及月度明细：` },
        { role: 'measurement-table', content: null, tableData, dynamicColumns },
      ]);
    } catch (e) {
      // 错误在 API 层已提示
      pushMessages([{ role: 'assistant', content: '获取测算详情失败，请稍后重试。' }]);
    }
  }, [pushMessages]);

  const generateReferenceProjectMessage = useCallback((project) => {
    const message = `帮我依据${project.projectName}项目生成待测算项目DE001-测试用的数据`;
    pushMessages([
      { role: 'user', content: message },
    ]);
    // 直接生成与右侧相同的基准任务工时及月度明细表
    generateMeasurementTable(project.id, project.projectName);
  }, [pushMessages, generateMeasurementTable]);

  


  const updateContent = (id, chunk, part) => {
    setChats(prev => prev.map(chat => {
      if (chat.id === id) {
        // If the chunk is a complete buffer, don't append, but replace
        if (part === 'complete') {
          return { ...chat, content: chunk };
        }

        const currentContent = chat.content;
        let newContent;
        if (typeof currentContent === 'object' && currentContent !== null) {
          newContent = { ...currentContent };
        } else {
          newContent = { thinking: '', reply: '' };
        }
        
        newContent[part] = (newContent[part] || '') + chunk;
        return { ...chat, content: newContent };
      }
      return chat;
    }));
  };

  const onChatsChange = useCallback(async (newChats) => {
    const last = newChats[newChats.length - 1];
    setChats(newChats);

    if (last && last.role === 'user') {
      const assistantMessageId = `${Date.now()}-assistant`;
      pushMessages([{ id: assistantMessageId, role: 'assistant', content: { thinking: '思考中...', reply: '' } }]);
      
      let buffer = '';
      let isThinking = false;

      // New: Buffer for the entire response
      let fullResponseBuffer = '';

      const onError = () => {
        setChats(prev => prev.map(chat =>
          chat.id === assistantMessageId ? { ...chat, content: '获取回复失败，请重试。' } : chat
        ));
      };
      
      await streamChatResponse(
        last.content, 
        (chunk) => {
            // Accumulate the full response
            fullResponseBuffer += chunk;

            buffer += chunk;

            const processBuffer = () => {
                if (!isThinking) {
                    const thinkStart = buffer.indexOf('<think>');
                    if (thinkStart === -1) {
                        updateContent(assistantMessageId, buffer, 'reply');
                        buffer = '';
                        return;
                    }
                    
                    const beforeThink = buffer.substring(0, thinkStart);
                    updateContent(assistantMessageId, beforeThink, 'reply');
                    buffer = buffer.substring(thinkStart + 7);
                    isThinking = true;
                }

                if (isThinking) {
                    const thinkEnd = buffer.indexOf('</think>');
                    if (thinkEnd === -1) {
                        updateContent(assistantMessageId, buffer, 'thinking');
                        buffer = '';
                        return;
                    }

                    const inThink = buffer.substring(0, thinkEnd);
                    updateContent(assistantMessageId, inThink, 'thinking');
                    buffer = buffer.substring(thinkEnd + 8);
                    isThinking = false;
                }
                if(buffer.length > 0) processBuffer();
            };

            processBuffer();
        },
        onError
      );

      // After stream is complete, update the message with the full buffered content
      updateContent(assistantMessageId, fullResponseBuffer, 'complete');

    }
  }, [pushMessages]);

  return {
    chats,
    setChats,
    pushMessages,
    onChatsChange,
    startNewConversationMessages,
    viewHistoryRecordMessages,
    generateReferenceProjectMessage,
    generateMeasurementTable,
  };
};
