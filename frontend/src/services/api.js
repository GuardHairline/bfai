import { message } from 'antd';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = new Error('Network response was not ok');
    error.response = response;
    throw error;
  }
  return response.json();
};

export const fetchTaskDetails = async (taskInfo) => {
  try {
    const { taskId, personId, departmentId } = taskInfo;
    const url = `/api/v1/bfa/tasks/${taskId}?person_id=${personId}&department_id=${departmentId}`;
    const response = await fetch(url);
    const result = await handleResponse(response);
    return result.data;
  } catch (error) {
    console.error("Failed to fetch project details:", error);
    message.error("��ȡ��Ŀ����ʧ��");
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
    message.error("��ȡ��ʷ��¼ʧ��");
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
    message.error("��ȡ�����б�ʧ��");
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
    message.error('��ȡ�ӿ����б�ʧ��');
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
    message.error("��ȡAI�ظ�ʧ��");
    if (onError) {
      onError(error);
    }
  }
};

export const fetchReferenceProjects = async (taskId, departmentId) => {
  try {
    const response = await fetch(`/api/v1/bfa/tasks/${taskId}/reference-projects?department_id=${departmentId}`);
    const result = await handleResponse(response);
    return result.data || [];
  } catch (error) {
    console.error("Failed to fetch reference projects:", error);
    message.error("��ȡ�ο���Ŀ�б�ʧ��");
    throw error;
  }
};

export const fetchHistoricalProjectDetails = async (projectId) => {
  try {
    const response = await fetch(`/api/v1/bfa/history/${projectId}/details`);
    const result = await handleResponse(response);
    return result.data || { table_data: [], dynamic_columns: [] };
  } catch (error) {
    console.error("Failed to fetch historical project details:", error);
    message.error("��ȡ��ʷ��Ŀ����ʧ��");
    throw error;
  }
};