import { useState, useEffect } from 'react';
import { fetchHistoricalProjectDetails } from '../services/api';

export const useHistoricalDetails = (projectId) => {
  const [details, setDetails] = useState({ tableData: [], dynamicColumns: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadDetails = async () => {
      if (!projectId) {
        setDetails({ tableData: [], dynamicColumns: [] });
        return;
      }
      
      setLoading(true);
      try {
        const data = await fetchHistoricalProjectDetails(projectId);
        setDetails({
          tableData: data.table_data || [],
          dynamicColumns: data.dynamic_columns || []
        });
      } catch (error) {
        // Error is already logged by the api service
        setDetails({ tableData: [], dynamicColumns: [] });
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [projectId]);

  return { ...details, loading };
};
