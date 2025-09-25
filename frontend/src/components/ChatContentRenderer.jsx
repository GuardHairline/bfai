import React, { useState, useEffect } from 'react';
import { Table } from 'antd';
import MarkdownIt from 'markdown-it';
import TaskList from './TaskList';
import HistoryTable from './HistoryTable';
import StrategyList from './StrategyList';
import ProjectInfo from './ProjectInfo';
import BaselineList from './BaselineList';
import BaselineDetails from './BaselineDetails';
import BaselineHistoryDetails from './BaselineHistoryDetails';
import MeasurementEntry from './MeasurementEntry';
import TaskDetails from './TaskDetails';
// import BaselineWorkHoursTable from './BaselineWorkHoursTable';
import HistoricalDetailsTable from './HistoricalDetailsTable';
import MeasurementTable from './MeasurementTable';

// --- Animated Components ---

const TypingText = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');
  useEffect(() => {
    setDisplayedText('');
    if (text) {
      let i = 0;
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayedText(prev => prev + text.charAt(i));
          i++;
        } else {
          clearInterval(interval);
        }
      }, 100); // Slower typing speed
      return () => clearInterval(interval);
    }
  }, [text]);
  return <div style={{ whiteSpace: 'pre-wrap' }}>{displayedText}</div>;
};

// 2. AnimatedTaskList for row-by-row animation
const AnimatedTaskList = ({ tasks, onSelect, ...restProps }) => {
    const [visibleTasks, setVisibleTasks] = useState([]);
    useEffect(() => {
        setVisibleTasks([]);
        if (tasks && tasks.length > 0) {
            const interval = setInterval(() => {
                setVisibleTasks(prev => {
                    if (prev.length < tasks.length) {
                        return [...prev, tasks[prev.length]];
                    }
                    clearInterval(interval);
                    return prev;
                });
            }, 500); // Slower row appearance speed
            return () => clearInterval(interval);
        }
    }, [tasks]);

    return <TaskList {...restProps} tasks={visibleTasks} onSelect={onSelect} />;
};

const AnimatedTable = ({ headers, rows }) => {
  const [visibleRows, setVisibleRows] = useState([]);

  useEffect(() => {
    setVisibleRows([]); // Reset on new data
    if (rows.length > 0) {
      const interval = setInterval(() => {
        setVisibleRows(prevRows => {
          if (prevRows.length < rows.length) {
            return [...prevRows, rows[prevRows.length]];
          }
          clearInterval(interval);
          return prevRows;
        });
      }, 300); // Slower table row appearance speed
      return () => clearInterval(interval);
    }
  }, [rows]);

  const columns = headers.map(header => ({
    title: header,
    dataIndex: header,
    key: header,
  }));

  const dataSource = visibleRows.map((row, index) => {
    const rowData = { key: index };
    headers.forEach((header, i) => {
      rowData[header] = row[i];
    });
    return rowData;
  });

  return <Table dataSource={dataSource} columns={columns} pagination={false} bordered size="small" />;
};


const ChatContentRenderer = ({ item, defaultDom, tasks, handleSelectTask, setConversationHistory, ...restProps }) => {

  // --- Animated Rendering Logic ---

  // Handle simple text messages from assistant (Welcome, etc.)
  if (item?.role === 'assistant' && typeof item.content === 'string' && !item.originData) {
      return <TypingText text={item.content} />;
  }
  
  // Handle complex component rendering with animation
  const role = item?.originData?.role;
  if (role === 'task-list') {
      const tasksWithUniqueKeys = (tasks || []).map(t => ({ ...t, key: t.task_person_id }));
      return (
        <AnimatedTaskList 
            tasks={tasksWithUniqueKeys} 
            onSelect={(task) => {
                handleSelectTask(task);
                setConversationHistory(prev => [...prev, { title: task.name, timestamp: new Date().toLocaleString() }]);
            }} 
            {...restProps} 
        />
      );
  }

  // Handle streamed text with markdown table animation
  if (typeof item.content === 'string' && item.content.includes('|--')) {
      const md = new MarkdownIt();
      const tokens = md.parse(item.content, {});
      const tableTokenIndex = tokens.findIndex(t => t.type === 'table_open');

      if (tableTokenIndex !== -1) {
        const headerTokens = tokens[tableTokenIndex + 2].children.map(t => t.content);
        const rowTokens = tokens[tableTokenIndex + 4].children.map(tr => 
          tr.children.map(td => td.content)
        );

        const textBeforeTable = tokens.slice(0, tableTokenIndex)
          .filter(t => t.type === 'inline' || t.type === 'paragraph_open')
          .map(t => t.content)
          .join('\n');

        return (
          <div>
            {textBeforeTable && <p style={{ whiteSpace: 'pre-wrap' }}>{textBeforeTable}</p>}
            <AnimatedTable headers={headerTokens} rows={rowTokens} />
          </div>
        );
      }
  }

  // Handle normally streamed text (AI reply)
  if (item?.originData?.role === 'assistant' && typeof item.content === 'object' && item.content !== null) {
    return (
      <div style={{ whiteSpace: 'pre-wrap' }}>
        {item.content.thinking && (
          <span style={{ color: '#aaa', fontStyle: 'italic' }}>
            {item.content.thinking}
          </span>
        )}
        {item.content.reply && <TypingText text={item.content.reply} />}
      </div>
    );
  }

  // Fallback to original non-animated rendering for all other specific components
  switch (role) {
    case 'history-table':
      return <HistoryTable history={restProps.historicalProjects} onReference={(record) => {
            const projectId = record.project_id || record.projectId || record.id;
            const projectName = record.name || record.measures_project;
            if (projectId) {
              restProps.generateHistoricalDetailsTable(projectId, projectName);
            }
          }} />;
    case 'task-details':
      return <TaskDetails details={restProps.projectDetails} onReferenceProject={restProps.generateReferenceProjectMessage} />;
    case 'project-info':
      return <ProjectInfo project={restProps.projectDetails} />;
    case 'strategy-list':
      return <StrategyList strategies={[]} onSelect={restProps.handleSelectStrategy} currentStrategy={restProps.currentStrategy} />;
    case 'baseline-list':
      // Using empty array as sampleData is removed
      return <BaselineList baselines={[]} selectedIds={restProps.selectedBaselineIds} onChange={restProps.setSelectedBaselineIds} onSubmit={restProps.handleConfirmBaselines} />;
    case 'baseline-details':
      return (
        <div style={{ width: '100%', overflowX: 'auto' }}>
          {/* Using empty array as sampleData is removed */}
          <BaselineDetails
            baselineIds={restProps.selectedBaselineIds}
            baselines={[]}
            onSubmit={restProps.handleSubmitMeasurement}
          />
        </div>
      );
    case 'baseline-history-details':
      return <BaselineHistoryDetails baselineIds={item.baselineIds || []} />;
    case 'measurement-entry':
      return <MeasurementEntry onStart={restProps.handleStartMeasurement} />;
    case 'measurement-table':
        const measurementPayload = item?.tableData || item?.dynamicColumns ? item : (item?.originData || {});
        return (
          <div style={{ minWidth: 0, overflowX: 'auto'}}>
            <MeasurementTable
              tableData={measurementPayload.tableData || []}
              dynamicColumns={measurementPayload.dynamicColumns || []}
              loading={false}
            />
          </div>
        );
    case 'historical-details-table':
      const payload = item?.tableData || item?.dynamicColumns ? item : (item?.originData || {});
      return (
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <HistoricalDetailsTable
            tableData={payload.tableData || []}
            dynamicColumns={payload.dynamicColumns || []}
            loading={false}
          />
        </div>
      );
    default:
      if (typeof item.content === 'string') {
        return <TypingText text={item.content} />;
      }
      return defaultDom;
  }
};

export default ChatContentRenderer;
