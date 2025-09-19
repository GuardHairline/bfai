import React, { useState, useEffect, useCallback } from 'react';
import { Layout, message } from 'antd';
import { ProCard } from '@ant-design/pro-components';

// 导入自定义组件
import HistorySidebar from './components/HistorySidebar';
import HeaderBar from './components/HeaderBar';
import ChatArea from './components/ChatArea';
import LoginModal from './components/LoginModal';
import ChatContentRenderer from './components/ChatContentRenderer';


// 导入自定义Hooks
import { useAuth } from './hooks/useAuth';
import { useChat } from './hooks/useChat';
import { useProject } from './hooks/useProject';
import { useMeasurement } from './hooks/useMeasurement';

const { Content, Sider } = Layout;

/**
 * App是业财一体化智能测算助手的根组件。
 * 它现在使用自定义Hooks来管理状态和副作用，使代码更清晰、更模块化。
 */
const App = () => {
  const [conversationHistory, setConversationHistory] = useState([]);
  const [selectedModel, setSelectedModel] = useState('default-model');

  const {
    loggedInUser,
    isLoginModalVisible,
    persons,
    handleToggleLogin,
    login,
    setIsLoginModalVisible,
  } = useAuth();

  const {
    chats,
    setChats,
    onChatsChange,
    pushMessages,
    startNewConversationMessages,
    viewHistoryRecordMessages,
  } = useChat();
  
  const {
    tasks,
    selectedTask,
    projectDetails,
    historicalProjects,
    measurementHistory,
    setMeasurementHistory,
    fetchTasks,
    handleSelectTask,
    setSelectedTask,
  } = useProject(pushMessages);
  
  const [selectedBaselineIds, setSelectedBaselineIds] = useState([]);
  const {
    currentStrategy,
    handleSelectStrategy,
    handleConfirmBaselines,
    handleSubmitMeasurement,
    resetMeasurementState,
  } = useMeasurement(pushMessages, selectedTask, selectedBaselineIds, setSelectedBaselineIds, setMeasurementHistory);

  /**
   * 开始一个全新的对话。
   */
  const startNewConversation = useCallback(() => {
    setChats([]);
    setSelectedTask(null);
    resetMeasurementState();
    startNewConversationMessages(loggedInUser);
  }, [loggedInUser, setChats, setSelectedTask, resetMeasurementState, startNewConversationMessages]);


  useEffect(() => {
    startNewConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedInUser]);

  const handleStartMeasurement = () => {
    if (!loggedInUser) {
      message.info('请先登录');
      return;
    }
    fetchTasks(loggedInUser);
  };

  const handleHistorySelect = (record) => {
    console.log("Selected history:", record);
    viewHistoryRecordMessages(record);
  };

  const contentRender = (item, defaultDom) => (
    <ChatContentRenderer
      item={item}
      defaultDom={defaultDom}
      tasks={tasks}
      handleSelectTask={handleSelectTask}
      setConversationHistory={setConversationHistory}
      historicalProjects={historicalProjects}
      projectDetails={projectDetails}
      handleSelectStrategy={handleSelectStrategy}
      currentStrategy={currentStrategy}
      selectedBaselineIds={selectedBaselineIds}
      setSelectedBaselineIds={setSelectedBaselineIds}
      handleConfirmBaselines={handleConfirmBaselines}
      handleSubmitMeasurement={handleSubmitMeasurement}
      handleStartMeasurement={handleStartMeasurement}
    />
  );

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
          onModelChange={setSelectedModel}
        />
        <Content style={{ flex: 1, padding: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <ProCard title="AI 对话" bordered headerBordered style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <ChatArea
              chats={chats}
              onChatsChange={onChatsChange}
              contentRender={contentRender}
            />
          </ProCard>
        </Content>
      </Layout>
      <LoginModal
        visible={isLoginModalVisible}
        onCancel={() => setIsLoginModalVisible(false)}
        persons={persons}
        onLogin={login}
      />
    </Layout>
  );
};

export default App;