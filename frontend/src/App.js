import React, { useState, useEffect } from 'react';
import { Layout, message, Modal, List, Button } from 'antd';
import { ProCard } from '@ant-design/pro-components';

// Import custom components
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

// Import sample data.  Replace these with API calls when integrating
// with a backend.
import {
  sampleBaseline,
} from './data/sampleData';

const { Content, Sider } = Layout;

/**
 * App is the root component for the BusinessFinanceAI demo.  It
 * manages conversation state and delegates rendering to child
 * components.  Static data is imported from sampleData.js and can
 * be replaced with real API calls in the future.
 */
const App = () => {
  // Conversation messages for ProChat
  const [chats, setChats] = useState([]);
  // Fetched tasks from backend
  const [tasks, setTasks] = useState([]);
  // Selected entities in measurement workflow
  const [selectedTask, setSelectedTask] = useState(null);
  const [projectDetails, setProjectDetails] = useState(null);
  const [historicalProjects, setHistoricalProjects] = useState([]);
  const [currentStrategy, setCurrentStrategy] = useState(null);
  const [selectedBaselineIds, setSelectedBaselineIds] = useState([]);
  const [baselineSelectionMode, setBaselineSelectionMode] = useState(false);
  // Histories for sidebar
  const [conversationHistory, setConversationHistory] = useState([]);
  const [measurementHistory, setMeasurementHistory] = useState([]);
  // Model selection and login state
  const [selectedModel, setSelectedModel] = useState('default-model');
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [persons, setPersons] = useState([]);


  /**
   * When the user clicks the "财务测算" start button in a new conversation,
   * push a task list message so the user can choose a pending project.
   */

  /**
   * Utility to append messages to the chat.  Each message is cloned
   * to assign unique IDs and timestamps.
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
   * Starts a fresh conversation and shows the measurement entry card.
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
   * Handler for selecting a task.  Resets subsequent selections and
   * records conversation history.  Sends project info, history table
   * and strategy options into the chat.
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
      // Fetch project details and historical projects in parallel
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
   * Handler for selecting a strategy.  If baselineIds are provided,
   * show baseline details directly; otherwise prompt for manual
   * selection.
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
   * Called after manual baseline selection.  Shows baseline details.
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
   * Final submission handler.  Records result into measurement history
   * and sends a confirmation message.
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
    // Reset selection without starting a new conversation automatically
    setSelectedTask(null);
    setCurrentStrategy(null);
    setSelectedBaselineIds([]);
    setBaselineSelectionMode(false);
  };

  /**
   * Renders custom chat items based on message roles.  Delegates
   * rendering to appropriate components.
   */
  const contentRender = (item, dom, defaultDom) => {
    const role = item?.originData?.role;
    switch (role) {
      case 'task-list':
        // Use a unique key for each item in the list to avoid React warnings
        const tasksWithUniqueKeys = tasks.map(t => ({ ...t, key: t.task_person_id }));
        return <TaskList tasks={tasksWithUniqueKeys} onSelect={handleSelectTask} />;
      case 'history-table': {
        return (
          <HistoryTable
            history={historicalProjects}
            onReference={(record) => {
              // This part can be implemented when strategy logic is finalized
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
   * Handles chat updates.  When the last message comes from the user,
   * inserts a placeholder assistant reply.  Otherwise, just update
   * the chat state.
   */
  const onChatsChange = async (newChats) => {
    const last = newChats[newChats.length - 1];
    setChats(newChats);

    if (last && last.role === 'user') {
      const assistantMessageId = `${Date.now()}-assistant`;
      // Add a placeholder for the assistant's response
      pushMessages([{ id: assistantMessageId, role: 'assistant', content: '...' }]);

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
        let fullResponse = '';

        setChats(prev => prev.map(chat =>
          chat.id === assistantMessageId ? { ...chat, content: '' } : chat
        ));

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          
          let chunk = decoder.decode(value, { stream: true });
          
          // Filter out <think> tags and other unwanted text
          chunk = chunk.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
          
          if (chunk) {
            fullResponse += chunk;
            setChats(prev => prev.map(chat =>
              chat.id === assistantMessageId ? { ...chat, content: fullResponse } : chat
            ));
          }
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
   * Handle click on a measurement history record.  Pushes the details
   * into the chat for viewing.
   */
  const handleHistorySelect = (record) => {
    pushMessages([
      { role: 'assistant', content: `您查看了历史测算记录：${record.title}` },
      { role: 'baseline-history-details', baselineIds: record.baselineIds },
    ]);
  };

  /**
   * Fetches tasks from the backend and displays them in the chat.
   * If a user is logged in, it will only fetch tasks for that user.
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
   * Fetches the list of persons from the backend to allow user selection.
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
   * Handles the login/logout toggle.
   */
  const handleToggleLogin = () => {
    if (loggedInUser) {
      setLoggedInUser(null);
      message.success('已登出');
    } else {
      fetchPersons();
    }
  };

  /**
   * Effect to reset the conversation whenever the login state changes.
   * This ensures a fresh start after login/logout.
   */
  useEffect(() => {
    startNewConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedInUser]);

  /**
   * When the user clicks the "财务测算" start button in a new conversation,
   * push a task list message so the user can choose a pending project.
   */
  const handleStartMeasurement = () => {
    if (!loggedInUser) {
      message.info('请先登录');
      return;
    }
    fetchTasks();
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