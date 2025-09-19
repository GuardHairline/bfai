import { useState, useCallback, useEffect } from 'react';
import { fetchTasks as apiFetchTasks, fetchTaskDetails as apiFetchTaskDetails, fetchHistory as apiFetchHistory } from '../services/api';

export const useProject = (pushMessages) => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [projectDetails, setProjectDetails] = useState(null);
  const [historicalProjects, setHistoricalProjects] = useState([]);
  const [measurementHistory, setMeasurementHistory] = useState([]);
  const [taskDetailsVisible, setTaskDetailsVisible] = useState(false);

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
    setTaskDetailsVisible(false); // 重置状态
    
    try {
      const taskInfo = {
        taskId: task.id,
        personId: task.calculator,
        departmentId: task.department_id
      };
      const details = await apiFetchTaskDetails(taskInfo);
      setProjectDetails(details);
      setTaskDetailsVisible(true); // 显示详情

      // 不再自动推送下一步，等待用户操作
      pushMessages([
        { role: 'assistant', content: `已选择项目：${task.name}。以下为该项目详细信息：` },
        { role: 'task-details', content: null },
      ]);

    } catch (error) {
      // Errors are handled in the api service.
    }
  }, [pushMessages]);

  const continueToMeasurement = useCallback(async () => {
    try {
      const history = await apiFetchHistory();
      setHistoricalProjects(history || []);
      
      pushMessages([
        {
          role: 'assistant',
          content: '以下为历史测算参考列表：请点击对应行的“参考并测算”按钮引用历史策略。',
        },
        { role: 'history-table', content: null },
      ]);
    } catch (error) {
        // Errors are handled in the api service
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
    taskDetailsVisible,
    continueToMeasurement,
  };
};
