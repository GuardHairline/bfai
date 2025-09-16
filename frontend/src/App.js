import React, { useState, useEffect } from 'react';
import { Layout, message, Modal, List, Button } from 'antd';
import { ProCard } from '@ant-design/pro-components';

// 导入自定义组件
import HistorySidebar from './components/HistorySidebar';
import HeaderBar from './components/HeaderBar';
import ChatArea from './components/ChatArea';
import TaskList from './components/TaskList';
import HistoryTable from './components/HistoryTable';
import StrategyList from './components/StrategyList';
import ProjectInfo from './components/ProjectInfo';
import BaselineList from './components/BaselineList';
import BaselineDetails from './components/BaselineDetails';
import BaselineHistoryDetails from './components/BaselineHistoryDetails';
import MeasurementEntry from './components/MeasurementEntry';

// 导入示例数据。在与后端集成时，这些应替换为API调用。
import {
  sampleBaseline,
} from './data/sampleData';

const { Content, Sider } = Layout;

/**
 * App是业财一体化智能测算助手的根组件。
 * 它管理整个应用的会话状态，并将渲染任务委托给子组件。
 * 静态数据从sampleData.js导入，将来可以用真实的API调用替换。
 */
const App = () => {
  // ProChat所需的对话消息
  const [chats, setChats] = useState([]);
  // 从后端获取的任务列表
  const [tasks, setTasks] = useState([]);
  // 测算流程中选定的实体
  const [selectedTask, setSelectedTask] = useState(null);
  const [projectDetails, setProjectDetails] = useState(null);
  const [historicalProjects, setHistoricalProjects] = useState([]);
  const [currentStrategy, setCurrentStrategy] = useState(null);
  const [selectedBaselineIds, setSelectedBaselineIds] = useState([]);
  const [baselineSelectionMode, setBaselineSelectionMode] = useState(false);
  // 侧边栏的历史记录
  const [conversationHistory, setConversationHistory] = useState([]);
  const [measurementHistory, setMeasurementHistory] = useState([]);
  // 模型选择和登录状态
  const [selectedModel, setSelectedModel] = useState('default-model');
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [persons, setPersons] = useState([]);

  /**
   * 工具函数，用于向聊天中追加消息。
   * 每条消息都会被克隆以分配唯一的ID和时间戳。
   */
  const pushMessages = (messages) => {
    setChats((prev) => [
      ...prev,
      ...messages.map((msg) => ({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        createAt: Date.now(),
        role: msg.role,
        content: msg.content || '',
        ...msg,
      })),
    ]);
  };

  /**
   * 开始一个全新的对话，并显示测算入口卡片。
   */
  const startNewConversation = () => {
    setChats([]);
    setSelectedTask(null);
    setCurrentStrategy(null);
    setSelectedBaselineIds([]);
    setBaselineSelectionMode(false);
    
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
  };

  /**
   * 处理任务选择的函数。
   * 重置后续选择，记录对话历史，并将项目信息、历史表格和策略选项发送到聊天中。
   */
  const handleSelectTask = async (task) => {
    setSelectedTask(task);
    setCurrentStrategy(null);
    setSelectedBaselineIds([]);
    setBaselineSelectionMode(false);
    setConversationHistory((prev) => [
      ...prev,
      { title: task.name, timestamp: new Date().toLocaleString() },
    ]);

    try {
      // 并行获取项目详情和历史项目
      const [detailsRes, historyRes] = await Promise.all([
        fetch(`/api/v1/bfa/tasks/${task.id}`),
        fetch('/api/v1/bfa/history')
      ]);

      if (!detailsRes.ok || !historyRes.ok) {
        throw new Error('Failed to fetch project data');
      }

      const detailsResult = await detailsRes.json();
      const historyResult = await historyRes.json();

      setProjectDetails(detailsResult.data);
      setHistoricalProjects(historyResult.data || []);
      
      pushMessages([
        { role: 'assistant', content: `已选择项目：${task.name}。以下为该项目基础信息：` },
        { role: 'project-info', content: null },
        {
          role: 'assistant',
          content: '以下为历史测算参考列表：请点击对应行的“参考并测算”按钮引用历史策略。',
        },
        { role: 'history-table', content: null },
      ]);

    } catch (error) {
      console.error("Failed to fetch project details:", error);
      message.error("获取项目详情或历史记录失败");
    }
  };

  /**
   * 处理策略选择的函数。
   * 如果提供了基准任务ID，则直接显示基准任务详情；否则提示手动选择。
   */
  const handleSelectStrategy = (strategy) => {
    setCurrentStrategy(strategy);
    if (strategy.baselineIds && strategy.baselineIds.length > 0) {
      setSelectedBaselineIds(strategy.baselineIds);
      setBaselineSelectionMode(false);
      pushMessages([
        { role: 'assistant', content: `已选择策略：${strategy.name}，以下为自动选择的基准任务：` },
        { role: 'baseline-details', content: null },
      ]);
    } else {
      setSelectedBaselineIds([]);
      setBaselineSelectionMode(true);
      pushMessages([
        { role: 'assistant', content: `已选择策略：${strategy.name}，请自定义选择基准任务：` },
        { role: 'baseline-list', content: null },
      ]);
    }
  };

  /**
   * 手动选择基准任务后调用。显示基准任务详情。
   */
  const handleConfirmBaselines = () => {
    if (selectedBaselineIds.length === 0) return;
    setBaselineSelectionMode(false);
    pushMessages([
      { role: 'assistant', content: '已确认选择的基准任务，以下为明细：' },
      { role: 'baseline-details', content: null },
    ]);
  };

  /**
   * 最终提交处理函数。
   * 将结果记录到测算历史中，并发送确认消息。
   */
  const handleSubmitMeasurement = () => {
    if (!selectedTask) return;
    const baselineNames = selectedBaselineIds.map((id) => sampleBaseline.find((b) => b.id === id)?.name || '');
    setMeasurementHistory((prev) => [
      ...prev,
      {
        title: `${selectedTask.name} - ${new Date().toLocaleString()}`,
        baseline: baselineNames,
        baselineIds: [...selectedBaselineIds],
      },
    ]);
    message.success('测算结果已提交');
    pushMessages([
      { role: 'assistant', content: '测算结果已提交，感谢您的使用！如需再次测算，请新建会话。' },
    ]);
    // 重置选择，但不自动开始新对话
    setSelectedTask(null);
    setCurrentStrategy(null);
    setSelectedBaselineIds([]);
    setBaselineSelectionMode(false);
  };

  /**
   * 根据消息角色渲染自定义聊天项目。
   * 将渲染任务委托给相应的组件。
   */
  const contentRender = (item, dom, defaultDom) => {
    // 自定义渲染助手消息，以处理思考和回复
    if (item?.originData?.role === 'assistant' && typeof item.content === 'object' && item.content !== null) {
      return (
        <div style={{ whiteSpace: 'pre-wrap' }}>
          {item.content.thinking && (
            <span style={{ color: '#aaa', fontStyle: 'italic' }}>
              {item.content.thinking}
            </span>
          )}
          {item.content.reply && (
            <span>
              {item.content.reply}
            </span>
          )}
        </div>
      );
    }

    const role = item?.originData?.role;
    switch (role) {
      case 'task-list':
        // 为列表中的每个项目使用唯一的key以避免React警告
        const tasksWithUniqueKeys = tasks.map(t => ({ ...t, key: t.task_person_id }));
        return <TaskList tasks={tasksWithUniqueKeys} onSelect={handleSelectTask} />;
      case 'history-table': {
        return (
          <HistoryTable
            history={historicalProjects}
            onReference={(record) => {
              // 当策略逻辑最终确定后，可以实现这部分
            }}
          />
        );
      }
      case 'project-info':
        return <ProjectInfo project={projectDetails} />;
      case 'strategy-list':
        return (
          <StrategyList strategies={[]} onSelect={handleSelectStrategy} currentStrategy={currentStrategy} />
        );
      case 'baseline-list':
        return (
          <BaselineList
            baselines={sampleBaseline}
            selectedIds={selectedBaselineIds}
            onChange={(ids) => setSelectedBaselineIds(ids)}
            onSubmit={handleConfirmBaselines}
          />
        );
      case 'baseline-details':
        return (
          <BaselineDetails
            baselineIds={selectedBaselineIds}
            baselines={sampleBaseline}
            onSubmit={handleSubmitMeasurement}
          />
        );
      case 'baseline-history-details':
        return <BaselineHistoryDetails baselineIds={item.baselineIds || []} />;
      case 'measurement-entry':
        return <MeasurementEntry onStart={handleStartMeasurement} />;
      default:
        return defaultDom;
    }
  };

  /**
   * 处理聊天更新。当最后一条消息来自用户时，
   * 向AI后端请求回复，并以流式方式更新UI。
   */
  const onChatsChange = async (newChats) => {
    const last = newChats[newChats.length - 1];
    setChats(newChats);

    if (last && last.role === 'user') {
      const assistantMessageId = `${Date.now()}-assistant`;
      // 为助手的响应添加一个占位符，其中包含一个复杂的内容对象
      pushMessages([{ id: assistantMessageId, role: 'assistant', content: { thinking: '', reply: '' } }]);

      try {
        const response = await fetch('/api/v1/bfa/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: last.content }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let isThinking = false;

        setChats(prev => prev.map(chat =>
          chat.id === assistantMessageId ? { ...chat, content: '' } : chat
        ));

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });

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
            // 如果缓冲区中还有更多内容，则再次处理
            if(buffer.length > 0) processBuffer();
          };

          processBuffer();
        }
      } catch (error) {
        console.error("Failed to get chat reply:", error);
        message.error("获取AI回复失败");
        setChats(prev => prev.map(chat =>
          chat.id === assistantMessageId ? { ...chat, content: '获取回复失败，请重试。' } : chat
        ));
      }
    }
  };

  /**
   * 辅助函数，用于更新特定聊天消息的内容。
   */
  const updateContent = (id, chunk, part) => {
    setChats(prev => prev.map(chat => {
      if (chat.id === id) {
        const newContent = { ...chat.content };
        newContent[part] = (newContent[part] || '') + chunk;
        return { ...chat, content: newContent };
      }
      return chat;
    }));
  };

  /**
   * 组件挂载后，开始一个新对话。
   * 当登录用户改变时，也会开始一个新对话。
   */
  useEffect(() => {
    startNewConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedInUser]);

  /**
   * 用户在新对话中点击“财务测算”开始按钮时，
   * 调用fetchTasks函数，获取待办任务列表。
   */
  const handleStartMeasurement = () => {
    if (!loggedInUser) {
      message.info('请先登录');
      return;
    }
    fetchTasks();
  };

  /**
   * 处理点击测算历史记录的函数。
   * 将详情推送到聊天中以供查看。
   */
  const handleHistorySelect = (record) => {
    // 此函数的内容可能需要更新，因为它引用了已删除的静态数据。
    // 目前，只是打印到控制台。
    console.log("Selected history:", record);
    pushMessages([
      { role: 'assistant', content: `您查看了历史测算记录：${record.name}` },
    ]);
  };

  /**
   * 从后端获取任务并在聊天中显示它们。
   * 如果用户已登录，则只获取该用户的任务。
   */
  const fetchTasks = async () => {
    try {
      let url = '/api/v1/bfa/tasks';
      if (loggedInUser) {
        url += `?person_id=${loggedInUser.id}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      if (result.data) {
        setTasks(result.data);
        pushMessages([
          { role: 'assistant', content: '以下是待办任务列表，请选择要测算的项目：' },
          { role: 'task-list', content: null },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      message.error("获取任务列表失败");
    }
  };

  /**
   * 从后端获取接口人列表，以供用户选择登录。
   */
  const fetchPersons = async () => {
    try {
      const response = await fetch('/api/v1/bfa/persons');
      if (!response.ok) throw new Error('Failed to fetch persons');
      const result = await response.json();
      setPersons(result.data || []);
      setIsLoginModalVisible(true);
    } catch (error) {
      console.error(error);
      message.error('获取接口人列表失败');
    }
  };

  /**
   * 处理登录/登出切换。
   */
  const handleToggleLogin = () => {
    if (loggedInUser) {
      setLoggedInUser(null);
      message.success('已登出');
    } else {
      fetchPersons();
    }
  };

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider width={280} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
        <HistorySidebar
          conversationHistory={conversationHistory}
          measurementHistory={measurementHistory}
          onNewConversation={startNewConversation}
          onHistorySelect={handleHistorySelect}
          loggedIn={!!loggedInUser}
          onToggleLogin={handleToggleLogin}
        />
      </Sider>
      <Layout style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <HeaderBar
          selectedTask={selectedTask}
          selectedModel={selectedModel}
          onModelChange={(val) => setSelectedModel(val)}
        />
        <Content
          style={{
            flex: 1,
            padding: 16,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <ProCard
            title="AI 对话"
            bordered
            headerBordered
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            <ChatArea
              chats={chats}
              onChatsChange={onChatsChange}
              contentRender={contentRender}
            />
          </ProCard>
        </Content>
      </Layout>
      <Modal
        title="选择登录身份"
        open={isLoginModalVisible}
        onCancel={() => setIsLoginModalVisible(false)}
        footer={null}
      >
        <List
          dataSource={persons}
          renderItem={(person) => (
            <List.Item
              actions={[<Button type="primary" onClick={() => {
                setLoggedInUser(person);
                setIsLoginModalVisible(false);
                message.success(`已作为 ${person.name} 登录`);
              }}>选择</Button>]}
            >
              <List.Item.Meta
                title={person.name}
                description={`部门: ${person.department}`}
              />
            </List.Item>
          )}
        />
      </Modal>
    </Layout>
  );
};

export default App;