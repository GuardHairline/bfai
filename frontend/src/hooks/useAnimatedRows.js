import React, { useState, useEffect } from 'react';

export const useAnimatedRows = (dataSource, delay = 300) => {
  const [visibleRows, setVisibleRows] = useState([]);

  useEffect(() => {
    setVisibleRows([]); 

    if (dataSource && dataSource.length > 0) {
      const interval = setInterval(() => {
        setVisibleRows(currentRows => {
          if (currentRows.length < dataSource.length) {
            return [...currentRows, dataSource[currentRows.length]];
          }
          clearInterval(interval);
          return currentRows;
        });
      }, delay);
      return () => clearInterval(interval);
    }
  }, [dataSource, delay]);

  return visibleRows;
};
