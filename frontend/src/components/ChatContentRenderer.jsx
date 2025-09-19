import React from 'react';

import TaskList from './TaskList';
import HistoryTable from './HistoryTable';
import StrategyList from './StrategyList';
import ProjectInfo from './ProjectInfo';
import BaselineList from './BaselineList';
import BaselineDetails from './BaselineDetails';
import BaselineHistoryDetails from './BaselineHistoryDetails';
import MeasurementEntry from './MeasurementEntry';
import { sampleBaseline } from '../data/sampleData';

const ChatContentRenderer = ({
  item,
  defaultDom,
  tasks,
  handleSelectTask,
  setConversationHistory,
  historicalProjects,
  projectDetails,
  handleSelectStrategy,
  currentStrategy,
  selectedBaselineIds,
  setSelectedBaselineIds,
  handleConfirmBaselines,
  handleSubmitMeasurement,
  handleStartMeasurement,
}) => {
  if (item?.originData?.role === 'assistant' && typeof item.content === 'object' && item.content !== null) {
    return (
      <div style={{ whiteSpace: 'pre-wrap' }}>
        {item.content.thinking && (
          <span style={{ color: '#aaa', fontStyle: 'italic' }}>
            {item.content.thinking}
          </span>
        )}
        {item.content.reply && <span>{item.content.reply}</span>}
      </div>
    );
  }

  const role = item?.originData?.role;
  switch (role) {
    case 'task-list':
      const tasksWithUniqueKeys = tasks.map(t => ({ ...t, key: t.task_person_id }));
      return <TaskList tasks={tasksWithUniqueKeys} onSelect={(task) => {
        handleSelectTask(task);
        setConversationHistory(prev => [...prev, { title: task.name, timestamp: new Date().toLocaleString() }]);
      }} />;
    case 'history-table':
      return <HistoryTable history={historicalProjects} onReference={() => { /* Implement later */ }} />;
    case 'project-info':
      return <ProjectInfo project={projectDetails} />;
    case 'strategy-list':
      return <StrategyList strategies={[]} onSelect={handleSelectStrategy} currentStrategy={currentStrategy} />;
    case 'baseline-list':
      return <BaselineList baselines={sampleBaseline} selectedIds={selectedBaselineIds} onChange={setSelectedBaselineIds} onSubmit={handleConfirmBaselines} />;
    case 'baseline-details':
      return <BaselineDetails baselineIds={selectedBaselineIds} baselines={sampleBaseline} onSubmit={handleSubmitMeasurement} />;
    case 'baseline-history-details':
      return <BaselineHistoryDetails baselineIds={item.baselineIds || []} />;
    case 'measurement-entry':
      return <MeasurementEntry onStart={handleStartMeasurement} />;
    default:
      return defaultDom;
  }
};

export default ChatContentRenderer;
