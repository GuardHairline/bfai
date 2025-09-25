import React, { useState, useEffect } from 'react';

export const useAnimatedRows = (dataSource, delay = 300) => {
    const [visibleRows, setVisibleRows] = useState([]);

    useEffect(() => {
        setVisibleRows([]);
        if (dataSource && dataSource.length > 0) {
            let i = 0;
            const interval = setInterval(() => {
                if (i < dataSource.length) {
                    setVisibleRows(prev => [...prev, dataSource[i]]);
                    i++;
                } else {
                    clearInterval(interval);
                }
            }, delay);
            return () => clearInterval(interval);
        }
    }, [dataSource, delay]);

    return visibleRows;
};
