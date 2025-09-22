import { useState, useCallback } from 'react';
import { streamChatResponse, fetchProjectOrderNames } from '../services/api';

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

  const generateBaselineWorkHoursResponse = useCallback(async (projectId) => {
    // 生成思考过程消息
    const thinkingMessages = [
      { role: 'assistant', content: '已思考' },
      { role: 'assistant', content: '已使用:同步历史项目数据至临时表' },
      { role: 'assistant', content: '已思考' },
      { role: 'assistant', content: '已使用:查询基准任务工时及月度明细' },
      { role: 'assistant', content: '已思考' },
    ];

    // 先推送思考过程消息
    pushMessages(thinkingMessages);

    try {
      // 获取项目的order_name
      let orderNames = [];
      if (projectId) {
        try {
          orderNames = await fetchProjectOrderNames(projectId);
        } catch (error) {
          console.log('获取order_name失败，使用模拟数据:', error);
          // 使用模拟数据
          orderNames = [
            `项目${projectId}-订单A`,
            `项目${projectId}-订单B`,
            `项目${projectId}-订单C`,
            `项目${projectId}-订单D`,
            `项目${projectId}-订单E`
          ];
        }
      }

      // 生成表格数据，使用真实的order_name
      const tableData = [
        {
          key: '1',
          serialNumber: 1,
          powerConfig: orderNames[0] || 'DE09（4B15E+DHT-3+PHEV+国内专属）',
          primaryTask: '计算数模质量质心',
          changeType: '借用',
          definitionScope: '',
          specificItem: '测试、完全借用',
          baselineHours: 40,
          totalReportedHours: 0,
          month202507: 0,
          month202508: 0,
        },
        {
          key: '2',
          serialNumber: 2,
          powerConfig: orderNames[1] || 'DE09（4B15E+DHT-3+PHEV+国内专属）',
          primaryTask: '全尺寸全功能检查表',
          changeType: '小改',
          definitionScope: '',
          specificItem: '测试、在现有机型基',
          baselineHours: 50,
          totalReportedHours: 0,
          month202507: 0,
          month202508: 0,
        },
        {
          key: '3',
          serialNumber: 3,
          powerConfig: orderNames[2] || 'DE09（4B15E+DHT-3+PHEV+国内专属）',
          primaryTask: '试验车辆跟踪及问题处理',
          changeType: '借用',
          definitionScope: '',
          specificItem: '测试2、完全借用',
          baselineHours: 60,
          totalReportedHours: 0,
          month202507: 0,
          month202508: 0,
        },
        {
          key: '4',
          serialNumber: 4,
          powerConfig: orderNames[3] || 'DE09（4B15E+DHT-3+PHEV+国内专属）',
          primaryTask: 'ET准入成本达成测量',
          changeType: '全新',
          definitionScope: '',
          specificItem: '测试6、全新开发',
          baselineHours: 70,
          totalReportedHours: 0,
          month202507: 0,
          month202508: 0,
        },
        {
          key: '5',
          serialNumber: 5,
          powerConfig: orderNames[4] || 'DE09（4B15E+DHT-3+PHEV+国内专属）',
          primaryTask: 'SE议题研讨',
          changeType: '小改',
          definitionScope: '',
          specificItem: '测试、在现有机型基',
          baselineHours: 80,
          totalReportedHours: 0,
          month202507: 0,
          month202508: 0,
        },
      ];

      // 生成表格消息
      const tableMessage = {
        role: 'baseline-work-hours-table',
        content: null,
        tableData: tableData,
      };

      // 推送表格消息
      pushMessages([tableMessage]);
    } catch (error) {
      console.error('获取项目order_name失败:', error);
      // 如果获取失败，使用默认数据
      const defaultTableData = [
        {
          key: '1',
          serialNumber: 1,
          powerConfig: 'DE09（4B15E+DHT-3+PHEV+国内专属）',
          primaryTask: '计算数模质量质心',
          changeType: '借用',
          definitionScope: '',
          specificItem: '测试、完全借用',
          baselineHours: 40,
          totalReportedHours: 0,
          month202507: 0,
          month202508: 0,
        },
      ];

      const tableMessage = {
        role: 'baseline-work-hours-table',
        content: null,
        tableData: defaultTableData,
      };

      pushMessages([tableMessage]);
    }
  }, [pushMessages]);

  const generateReferenceProjectMessage = useCallback((project) => {
    const message = `帮我依据${project.projectName}项目生成待测算项目DE001-测试用的数据`;
    pushMessages([
      { role: 'user', content: message },
    ]);
    
    // 延迟一下再生成AI回复，模拟真实对话
    setTimeout(() => {
      generateBaselineWorkHoursResponse(project.id);
    }, 1000);
  }, [pushMessages, generateBaselineWorkHoursResponse]);


  const updateContent = (id, chunk, part) => {
    setChats(prev => prev.map(chat => {
      if (chat.id === id) {
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

      const onError = () => {
        setChats(prev => prev.map(chat =>
          chat.id === assistantMessageId ? { ...chat, content: '获取回复失败，请重试。' } : chat
        ));
      };
      
      await streamChatResponse(
        last.content, 
        (chunk) => {
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
    generateBaselineWorkHoursResponse,
  };
};
