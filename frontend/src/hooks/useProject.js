import { useState, useCallback, useEffect } from 'react';
import { fetchTasks as apiFetchTasks, fetchTaskDetails as apiFetchTaskDetails, fetchHistory as apiFetchHistory } from '../services/api';

export const useProject = (pushMessages) => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [projectDetails, setProjectDetails] = useState(null);
  const [historicalProjects, setHistoricalProjects] = useState([]);
  const [measurementHistory, setMeasurementHistory] = useState([]);

  const fetchTasks = useCallback(async (loggedInUser) => {
    try {
      const fetchedTasks = await apiFetchTasks(loggedInUser?.id);
      if (fetchedTasks) {
        setTasks(fetchedTasks);
        pushMessages([
          { role: 'assistant', content: '以下是待办任务列表，请选择要测算的项目：' },
          { role: 'task-list', content: null },
        ]);
      }
    } catch (error) {
      // Errors are handled in the api service, but you might want to add component-specific feedback here.
    }
  }, [pushMessages]);

  const handleSelectTask = useCallback(async (task) => {
    setSelectedTask(task);
    // Reset subsequent selections
    // setCurrentStrategy(null);
    // setSelectedBaselineIds([]);
    // setBaselineSelectionMode(false);
    
    try {
      const [details, history] = await Promise.all([
        apiFetchTaskDetails(task.id),
        apiFetchHistory()
      ]);

      setProjectDetails(details);
      setHistoricalProjects(history || []);
      
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
      // Errors are handled in the api service.
    }
  }, [pushMessages]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await apiFetchHistory();
        setMeasurementHistory(history);
      } catch (error) {
        // Errors are handled in the api service.
      }
    };
    loadHistory();
  }, []);

  return {
    tasks,
    selectedTask,
    projectDetails,
    historicalProjects,
    measurementHistory,
    setMeasurementHistory,
    fetchTasks,
    handleSelectTask,
    setSelectedTask,
  };
};
