import { useState, useEffect, useCallback } from 'react';
import { fetchReferenceProjects } from '../services/api';

export const useReferenceProjects = (taskId, departmentId) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadProjects = useCallback(async () => {
    if (taskId && departmentId) {
      setLoading(true);
      try {
        const data = await fetchReferenceProjects(taskId, departmentId);
        setProjects(data);
      } catch (error) {
        // Error is already logged and displayed by the api service
      } finally {
        setLoading(false);
      }
    }
  }, [taskId, departmentId]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return { projects, loading, refresh: loadProjects };
};
