import React, { useState, useEffect } from 'react';
import { Layout, message } from 'antd';
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
  sampleTasks,
  projectInfo,
  sampleBaseline,
  strategies,
  initialMeasurementHistory,
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
  // Selected entities in measurement workflow
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentStrategy, setCurrentStrategy] = useState(null);
  const [selectedBaselineIds, setSelectedBaselineIds] = useState([]);
  const [baselineSelectionMode, setBaselineSelectionMode] = useState(false);
  // Histories for sidebar
  const [conversationHistory, setConversationHistory] = useState([]);
  const [measurementHistory, setMeasurementHistory] = useState(
    initialMeasurementHistory,
  );
  // Model selection and login state
  const [selectedModel, setSelectedModel] = useState('default-model');
  const [loggedIn, setLoggedIn] = useState(false);

  /**
   * When the user clicks the "财务测算" start button in a new conversation,
   * push a task list message so the user can choose a pending project.
   */
  const handleStartMeasurement = () => {
    pushMessages([
      { role: 'assistant', content: '请选择代办测算任务：' },
      { role: 'task-list', content: null },
    ]);
  };

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
    // Display measurement entry in chat
    pushMessages([
      { role: 'assistant', content: '请选择需要进行的操作：' },
      { role: 'measurement-entry', content: null },
    ]);
  };

  /**
   * Handler for selecting a task.  Resets subsequent selections and
   * records conversation history.  Sends project info, history table
   * and strategy options into the chat.
   */
  const handleSelectTask = (task) => {
    setSelectedTask(task);
    setCurrentStrategy(null);
    setSelectedBaselineIds([]);
    setBaselineSelectionMode(false);
    setConversationHistory((prev) => [
      ...prev,
      { title: task.name, timestamp: new Date().toLocaleString() },
    ]);
    pushMessages([
      { role: 'assistant', content: `已选择项目：${task.name}。以下为该项目基础信息：` },
      { role: 'project-info', content: null },
      {
        role: 'assistant',
        content: '以下为历史测算参考列表：请点击对应行的“参考并测算”按钮引用历史策略。',
      },
      { role: 'history-table', content: null },
    ]);
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
        return <TaskList tasks={sampleTasks} onSelect={handleSelectTask} />;
      case 'history-table': {
        // Build history rows: here we simply mirror the sampleTasks and assign strategies by index.
        const historyRows = sampleTasks.map((t, index) => ({
          id: t.id,
          name: t.name,
          department: t.department,
          calculator: '刘晶晶',
          brand: t.brand,
          spec: t.spec,
          strategyId: strategies[index] ? strategies[index].id : strategies[strategies.length - 1].id,
        }));
        return (
          <HistoryTable
            history={historyRows}
            onReference={(record) => {
              const strategy = strategies.find((s) => s.id === record.strategyId);
              if (strategy) handleSelectStrategy(strategy);
            }}
          />
        );
      }
      case 'project-info':
        return <ProjectInfo project={projectInfo} />;
      case 'strategy-list':
        return (
          <StrategyList strategies={strategies} onSelect={handleSelectStrategy} currentStrategy={currentStrategy} />
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
  const onChatsChange = (newChats) => {
    const last = newChats[newChats.length - 1];
    if (last && last.role === 'user') {
      pushMessages([
        {
          role: 'assistant',
          content: '该回复由示例生成，实际对话需接入后端。',
        },
      ]);
    }
    setChats(newChats);
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
   * On initial mount start a new conversation.
   */
  useEffect(() => {
    startNewConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider width={280} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
        <HistorySidebar
          conversationHistory={conversationHistory}
          measurementHistory={measurementHistory}
          onNewConversation={startNewConversation}
          onHistorySelect={handleHistorySelect}
          loggedIn={loggedIn}
          onToggleLogin={() => setLoggedIn(!loggedIn)}
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
    </Layout>
  );
};

export default App;