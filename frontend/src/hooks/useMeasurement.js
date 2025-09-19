import { useState, useCallback } from 'react';
import { message } from 'antd';
import { sampleBaseline } from '../data/sampleData';

export const useMeasurement = (pushMessages, selectedTask, selectedBaselineIds, setSelectedBaselineIds, setMeasurementHistory) => {
  const [currentStrategy, setCurrentStrategy] = useState(null);
  const [baselineSelectionMode, setBaselineSelectionMode] = useState(false);

  const handleSelectStrategy = useCallback((strategy) => {
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
  }, [pushMessages, setSelectedBaselineIds]);

  const handleConfirmBaselines = useCallback(() => {
    if (selectedBaselineIds.length === 0) return;
    setBaselineSelectionMode(false);
    pushMessages([
      { role: 'assistant', content: '已确认选择的基准任务，以下为明细：' },
      { role: 'baseline-details', content: null },
    ]);
  }, [selectedBaselineIds.length, pushMessages]);

  const handleSubmitMeasurement = useCallback(() => {
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
    
    // Reset selections
    // setSelectedTask(null);
    setCurrentStrategy(null);
    setSelectedBaselineIds([]);
    setBaselineSelectionMode(false);
  }, [selectedTask, selectedBaselineIds, pushMessages, setMeasurementHistory, setSelectedBaselineIds]);
  
  const resetMeasurementState = () => {
    setCurrentStrategy(null);
    setSelectedBaselineIds([]);
    setBaselineSelectionMode(false);
  };

  return {
    currentStrategy,
    baselineSelectionMode,
    selectedBaselineIds,
    setSelectedBaselineIds,
    handleSelectStrategy,
    handleConfirmBaselines,
    handleSubmitMeasurement,
    resetMeasurementState,
  };
};
