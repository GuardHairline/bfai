import { message } from 'antd';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = new Error('Network response was not ok');
    error.response = response;
    throw error;
  }
  return response.json();
};

export const fetchTaskDetails = async (taskId) => {
  try {
    const response = await fetch(`/api/v1/bfa/tasks/${taskId}`);
    const result = await handleResponse(response);
    return result.data;
  } catch (error) {
    console.error("Failed to fetch project details:", error);
    message.error("获取项目详情失败");
    throw error;
  }
};

export const fetchHistory = async () => {
  try {
    const response = await fetch('/api/v1/bfa/history');
    const result = await handleResponse(response);
    return result.data || [];
  } catch (error) {
    console.error("Failed to fetch history:", error);
    message.error("获取历史记录失败");
    throw error;
  }
};

export const fetchTasks = async (personId) => {
  try {
    let url = '/api/v1/bfa/tasks';
    if (personId) {
      url += `?person_id=${personId}`;
    }
    const response = await fetch(url);
    const result = await handleResponse(response);
    return result.data || [];
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    message.error("获取任务列表失败");
    throw error;
  }
};

export const fetchPersons = async () => {
  try {
    const response = await fetch('/api/v1/bfa/persons');
    const result = await handleResponse(response);
    return result.data || [];
  } catch (error) {
    console.error("Failed to fetch persons:", error);
    message.error('获取接口人列表失败');
    throw error;
  }
};

export const streamChatResponse = async (chatMessage, onChunk, onError) => {
  try {
    const response = await fetch('/api/v1/bfa/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: chatMessage }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      onChunk(chunk);
    }
  } catch (error) {
    console.error("Failed to get chat reply:", error);
    message.error("获取AI回复失败");
    if (onError) {
      onError(error);
    }
  }
};
