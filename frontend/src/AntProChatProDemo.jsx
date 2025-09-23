/**
 * This React component demonstrates how to drive an entire measurement
 * workflow through a single ProChat conversation.  All interactive
 * elements—tasks list, project information, strategy options and
 * baseline selection—are delivered as chat messages.  Users can
 * click buttons and tables inside the chat to advance through the
 * measurement flow.  The left sidebar maintains conversation and
 * measurement histories, while the right side hosts only the chat.
 *
 * Dependencies:
 *  - React 18
 *  - antd (v5)
 *  - @ant-design/pro-components (ProTable, ProDescriptions, ProCard)
 *  - @ant-design/pro-chat
 *  - @ant-design/icons (if icons are needed elsewhere)
 *  - antd-style (peer dependency of pro-chat)
 *
 * To integrate this component into a project created via Create
 * React App or Vite, ensure the above packages are installed and
 * imported correctly.  Replace the dummy data with API calls as
 * needed to drive real-world interactions.  See README or the
 * `ant_pro_chat_pro_demo.jsx` file for a version of this interface
 * where tables live outside the chat.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Layout, List, Button, message, Space, Typography } from 'antd';
import { ProChat } from '@ant-design/pro-chat';
import { ProTable, ProDescriptions, ProCard, EditableProTable } from '@ant-design/pro-components';

const { Header, Sider, Content } = Layout;
const { Title, Paragraph } = Typography;

/* ---------- Sample Data -------------------------------------------------- */

// A list of pending measurement tasks.  Each entry corresponds to a
// project requiring financial estimation.  Replace with API data
// when connecting to your backend.
const sampleTasks = [
  {
    id: 1,
    name: '南京汽车测试项目',
    department: '发动机系统研发部',
    calculator: '小明',
    brand: '皮卡',
    spec: 'M',
  },
  {
    id: 2,
    name: 'ES11中东版',
    department: '发动机系统研发部',
    calculator: '小明',
    brand: 'WEY',
    spec: 'SS',
  },
];

// Static project information displayed once a task is chosen.  In a real
// implementation you should fetch this data based on the selected
// task's ID.
const projectInfo = {
  projectId: '1460139557956620288',
  projectName: 'DE001-测试用',
  department: '发动机系统研发部',
  brand: '哈弗',
  scale: 'M',
  status: '测算中',
  calculator: '小明',
  createdAt: '2025-07-07 14:41:22',
  updatedAt: '2025-07-12 17:28:39',
  orderInfo: '1120DE09-02.1120DE09-03',
  powerConfig: 'DE09(4B15E+DHT-3+PHEV+国内专属),DE09(E20NA+DHT-3+PHEV+国内专属)',
};

// Baseline tasks and their associated data.  Each entry describes a
// first-level task that can be included in a measurement.  Use your
// own baseline library data here.
const sampleBaseline = [
  {
    id: 1,
    powerConfig: 'DE09（4B15E+DHT - 3+PHEV+国内专属）',
    name: '计算数模质量质心',
    type: '借用',
    matter: '测试、完全借用',
    hours: 40,
    // For demonstration, add a months field representing the duration
    // of the task in months.  When computing summary information
    // below, we sum these values by power configuration.
    months: 2,
  },
  {
    id: 2,
    powerConfig: 'DE09（4B15E+DHT - 3+PHEV+国内专属）',
    name: '全尺寸全功能检查表',
    type: '小改',
    matter: '测试、在现有机型基',
    hours: 50,
    months: 2,
  },
  {
    id: 3,
    powerConfig: 'DE09（4B15E+DHT - 3+PHEV+国内专属）',
    name: '试验车辆跟踪及问题处理',
    type: '借用',
    matter: '测试2、完全借用',
    hours: 60,
    months: 3,
  },
  {
    id: 4,
    powerConfig: 'DE09（4B15E+DHT - 3+PHEV+国内专属）',
    name: 'ET准入成本达成测量',
    type: '全新',
    matter: '测试6、全新开发',
    hours: 70,
    months: 3,
  },
  {
    id: 5,
    powerConfig: 'DE09（4B15E+DHT - 3+PHEV+国内专属）',
    name: 'SE议题研讨',
    type: '小改',
    matter: '测试、在现有机型基',
    hours: 80,
    months: 4,
  },
  {
    id: 6,
    powerConfig: 'DE09（4B15E+DHT - 3+PHEV+国内专属）',
    name: '标杆专利检索申请及报告确认',
    type: '全新',
    matter: '测试3、全新开发',
    hours: 90,
    months: 4,
  },
  {
    id: 7,
    powerConfig: 'DE09（4B15E+DHT - 3+PHEV+国内专属）',
    name: '设计评价确认 - PT',
    type: '全新',
    matter: '测试4、全新开发',
    hours: 60,
    months: 5,
  },
  {
    id: 8,
    powerConfig: 'DE09（4B15E+DHT - 3+PHEV+国内专属）',
    name: '标杆专利检索申请及报告确认',
    type: '全新',
    matter: '测试2、全新开发',
    hours: 50,
    months: 5,
  },
  {
    id: 9,
    powerConfig: 'DE09（4B15E+DHT - 3+PHEV+国内专属）',
    name: '保安防灾校核',
    type: '全新',
    matter: '测试2、全新开发',
    hours: 45,
    months: 3,
  },
  {
    id: 10,
    powerConfig: 'DE09（4B15E+DHT - 3+PHEV+国内专属）',
    name: '车型成本重量动态跟踪表 - NC',
    type: '借用',
    matter: '测试、完全借用',
    hours: 55,
    months: 2,
  },
];

// Strategies that can be suggested by the AI.  Each strategy
// references a list of baseline task IDs.  Strategies without
// baselineIds allow the user to pick tasks manually.
const strategies = [
  {
    id: 1,
    name: '历史测算策略：南京汽车测试项目',
    baselineIds: [1, 2, 3],
  },
  {
    id: 2,
    name: '历史测算策略：ES11中东版-项目复测',
    baselineIds: [4, 5, 6],
  },
  {
    id: 3,
    name: '自定义选择基准任务',
    baselineIds: [],
  },
];

// Static historical measurement records.  These can be replaced
// with real history data from your backend.  Each entry includes
// baselineIds so we can look up details when the history item is
// clicked in the sidebar.
const initialMeasurementHistory = [
  {
    title: '南京汽车测试项目 - 示例',
    baseline: ['计算数模质量质心', '全尺寸全功能检查表', '试验车辆跟踪及问题处理'],
    baselineIds: [1, 2, 3],
  },
  {
    title: 'ES11中东版-项目复测 - 示例',
    baseline: ['ET准入成本达成测量', 'SE议题研讨', '标杆专利检索申请及报告确认'],
    baselineIds: [4, 5, 6],
  },
];

/* ---------- Custom Components for Chat Rendering ------------------------- */

/**
 * TaskList renders a table of measurement tasks and allows the user to
 * select one.  It uses ProTable for styling consistency with
 * Ant Design Pro.  When a row's button is clicked the provided
 * onSelect callback will receive the selected task.
 */
const TaskList = ({ tasks, onSelect }) => {
  const columns = [
    { title: '项目名称', dataIndex: 'name' },
    { title: '部门', dataIndex: 'department' },
    { title: '测算人', dataIndex: 'calculator' },
    { title: '品牌', dataIndex: 'brand' },
    { title: '开发规格', dataIndex: 'spec' },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => {
        return [
          <Button type="link" key="measure" onClick={() => onSelect(record)}>
            测算
          </Button>,
        ];
      },
    },
  ];
  return (
    <ProTable
      rowKey="id"
      dataSource={tasks}
      columns={columns}
      search={false}
      options={false}
      pagination={false}
    />
  );
};

/**
 * HistoryTable renders a list of historical measurements within
 * the chat.  Each row includes a button to reference a past
 * measurement strategy.  When clicked the onReference callback is
 * invoked with the corresponding record.  This allows users to quickly
 * reference prior measurements.
 */
const HistoryTable = ({ history, onReference }) => {
  const columns = [
    { title: '项目名称', dataIndex: 'name' },
    { title: '部门', dataIndex: 'department' },
    { title: '测算人', dataIndex: 'calculator' },
    { title: '品牌', dataIndex: 'brand' },
    { title: '开发规格', dataIndex: 'spec' },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => {
        return [
          <Button
            type="link"
            key="reference"
            onClick={() => onReference(record)}
          >
            参考并测算
          </Button>,
        ];
      },
    },
  ];
  return (
    <ProTable
      rowKey="id"
      dataSource={history}
      columns={columns}
      search={false}
      options={false}
      pagination={false}
    />
  );
};

/**
 * StrategyList renders a list of measurement strategies as buttons.
 * When clicked, the onSelect callback is invoked with the selected
 * strategy object.
 */
const StrategyList = ({ strategies, onSelect, currentStrategy }) => {
  return (
    <div>
      {strategies.map((str) => (
        <Button
          key={str.id}
          type={currentStrategy?.id === str.id ? 'primary' : 'default'}
          onClick={() => onSelect(str)}
          style={{ marginRight: 8, marginBottom: 8 }}
        >
          {str.name}
        </Button>
      ))}
    </div>
  );
};

/**
 * ProjectInfo displays the base information for the selected project.
 */
const ProjectInfo = ({ project }) => {
  const columns = [
    { title: '项目ID', dataIndex: 'projectId' },
    { title: '项目名称', dataIndex: 'projectName' },
    { title: '部门', dataIndex: 'department' },
    { title: '品牌', dataIndex: 'brand' },
    { title: '开发规模(SML)', dataIndex: 'scale' },
    { title: '测算状态', dataIndex: 'status' },
    { title: '测算人', dataIndex: 'calculator' },
    { title: '创建时间', dataIndex: 'createdAt' },
    { title: '更新时间', dataIndex: 'updatedAt' },
    { title: '订单信息', dataIndex: 'orderInfo' },
    { title: '动力配置', dataIndex: 'powerConfig' },
  ];
  return (
    <ProDescriptions
      title="项目基础信息"
      dataSource={project}
      columns={columns}
      column={1}
      bordered
      size="small"
      style={{ marginBottom: 16 }}
    />
  );
};

/**
 * BaselineList renders a table of baseline tasks with row
 * selection.  The onChange callback receives the selected row keys.
 * An explicit submit button triggers the onSubmit callback.
 */
const BaselineList = ({ baselines, selectedIds, onChange, onSubmit }) => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '动力配置', dataIndex: 'powerConfig' },
    { title: '一级任务', dataIndex: 'name' },
    { title: '改动类型', dataIndex: 'type' },
    { title: '具体事项', dataIndex: 'matter' },
  ];
  return (
    <div>
      <ProTable
        rowKey="id"
        dataSource={baselines}
        columns={columns}
        search={false}
        options={false}
        pagination={false}
        rowSelection={{
          selectedRowKeys: selectedIds,
          onChange: (keys) => onChange(keys),
        }}
      />
      <div style={{ marginTop: 16 }}>
        <Button
          type="primary"
          onClick={() => onSubmit()}
          disabled={selectedIds.length === 0}
        >
          提交测算结果
        </Button>
      </div>
    </div>
  );
};

/**
 * BaselineDetails shows the selected baselines in a table and
 * summarises total hours.  A submit button triggers measurement
 * submission.
 */
const BaselineDetails = ({ baselineIds, baselines, onSubmit }) => {
  // Create a local editable state so user modifications do not
  // directly mutate the master baseline list.  Start with a
  // shallow copy of the selected baseline entries.
  const [dataSource, setDataSource] = useState(() =>
    baselineIds
      .map((id) => baselines.find((b) => b.id === id))
      .filter(Boolean)
      .map((item) => ({ ...item })),
  );
  // Editing mode toggles whether the table is editable
  const [editing, setEditing] = useState(false);

  // Recompute summary information whenever dataSource changes.  The
  // total hours are the sum of hours for all tasks.  Unique power
  // configurations are collected in a Set.  For each configuration
  // compute the sum of months for tasks under that config.  The
  // summary is displayed below the table.
  const totalHours = dataSource.reduce(
    (sum, item) => sum + (item?.hours || 0),
    0,
  );
  const configSet = new Set();
  const configMonths = {};
  dataSource.forEach((item) => {
    if (!item) return;
    const cfg = item.powerConfig;
    configSet.add(cfg);
    configMonths[cfg] = (configMonths[cfg] || 0) + (item.months || 0);
  });

  // Columns definition for editable table.  Each field can be edited
  // except the id.  EditableProTable uses the editableConfig to
  // control editing.
  const columns = [
    {
      title: '序号',
      dataIndex: 'id',
      editable: false,
    },
    {
      title: '动力配置',
      dataIndex: 'powerConfig',
    },
    {
      title: '一级任务',
      dataIndex: 'name',
    },
    {
      title: '改动类型',
      dataIndex: 'type',
    },
    {
      title: '具体事项',
      dataIndex: 'matter',
    },
    {
      title: '工时',
      dataIndex: 'hours',
    },
    {
      title: '月数',
      dataIndex: 'months',
    },
  ];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <span style={{ fontWeight: 500 }}>基准任务工时及月度明细</span>
        <Button onClick={() => setEditing(!editing)}>
          {editing ? '完成编辑' : '编辑'}
        </Button>
      </div>
      <EditableProTable
        rowKey="id"
        value={dataSource}
        columns={columns}
        recordCreatorProps={false}
        pagination={false}
        editable={{
        editableKeys: editing ? dataSource.map((d) => d.id) : [],
          onChange: (editableKeys, rows) => {
            // Not used here, required by EditableProTable
          },
          onSave: async (rowKey, data, row) => {
            setDataSource((prev) =>
              prev.map((item) => (item.id === rowKey ? { ...row } : item)),
            );
          },
          type: editing ? 'multiple' : undefined,
        }}
      />
      <Paragraph style={{ marginTop: 16 }}>
        共查询到 {dataSource.length} 条基准任务工时记录；总目标工时合计:
        {totalHours} 工时；动力配置总数: {configSet.size} 种；日程月数:
        {Object.entries(configMonths)
          .map(
            ([cfg, months]) =>
              `${cfg}${months}个月`,
          )
          .join('，')}
        。
      </Paragraph>
      <Button type="primary" onClick={() => onSubmit()}>
        提交测算结果
      </Button>
    </div>
  );
};

/**
 * BaselineHistoryDetails renders baseline details from a history
 * record.  It is read-only and displays the same summary
 * information as BaselineDetails without editing or submit
 * actions.
 */
const BaselineHistoryDetails = ({ baselineIds }) => {
  const dataSource = baselineIds
    .map((id) => sampleBaseline.find((b) => b.id === id))
    .filter(Boolean)
    .map((item) => ({ ...item }));
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '动力配置', dataIndex: 'powerConfig' },
    { title: '一级任务', dataIndex: 'name' },
    { title: '改动类型', dataIndex: 'type' },
    { title: '具体事项', dataIndex: 'matter' },
    { title: '工时', dataIndex: 'hours' },
    { title: '月数', dataIndex: 'months' },
  ];
  const totalHours = dataSource.reduce(
    (sum, item) => sum + (item?.hours || 0),
    0,
  );
  const configSet = new Set();
  const configMonths = {};
  dataSource.forEach((item) => {
    if (!item) return;
    const cfg = item.powerConfig;
    configSet.add(cfg);
    configMonths[cfg] = (configMonths[cfg] || 0) + (item.months || 0);
  });
  return (
    <div>
      <ProTable
        rowKey="id"
        dataSource={dataSource}
        columns={columns}
        search={false}
        options={false}
        pagination={false}
      />
      <Paragraph style={{ marginTop: 16 }}>
        共查询到 {dataSource.length} 条基准任务工时记录；总目标工时合计:{totalHours}
        工时；动力配置总数: {configSet.size} 种；日程月数:{' '}
        {Object.entries(configMonths)
          .map(([cfg, months]) => `${cfg}${months}个月`)
          .join('，')}
        。
      </Paragraph>
    </div>
  );
};

/* ---------- Main Component ---------------------------------------------- */

/**
 * AntProChatAIDemo encapsulates the entire measurement process within a
 * chat conversation.  Each step of the workflow is triggered by a
 * button click inside a chat message and causes new messages to
 * appear, guiding the user through selecting tasks, strategies and
 * baselines, and finally submitting the measurement.
 */
const AntProChatAIDemo = () => {
  // Conversation messages for the ProChat component.  Each message
  // includes a unique id, role and content.  Custom roles (e.g.
  // 'task-list', 'strategy-list') are used to trigger custom
  // rendering inside the chat.
  const [chats, setChats] = useState([]);

  // Selected entities during the measurement workflow
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentStrategy, setCurrentStrategy] = useState(null);
  const [selectedBaselineIds, setSelectedBaselineIds] = useState([]);
  const [baselineSelectionMode, setBaselineSelectionMode] = useState(false);

  // History panels on the sidebar
  const [conversationHistory, setConversationHistory] = useState([]);
  // Preload the measurement history with some demo entries.  Each entry
  // stores baselineIds so details can be fetched when clicked.
  const [measurementHistory, setMeasurementHistory] = useState(
    initialMeasurementHistory,
  );

  // Ref used for auto-scrolling to the latest message.  Each time
  // chats update, we scroll this anchor into view.
  const messagesEndRef = useRef(null);


  useEffect(() => {
    // Scroll the anchor element into view to ensure the latest message is visible.
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chats]);

  /**
   * Utility function to push one or more messages onto the chat
   * history.  Accepts an array of message objects.  Each new
   * message must have a unique id; here we generate ids using
   * Date.now() concatenated with a random number.
   */
  const pushMessages = (messages) => {
    setChats((prev) => [
      ...prev,
      ...messages.map((msg) => ({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        createAt: Date.now(),
        role: msg.role,
        content: msg.content || '',
        // originData carries the custom role so chatItemRenderConfig
        // can identify what to render.  Additional metadata can be
        // attached here if needed.
        ...msg,
      })),
    ]);
  };

  /**
   * Handler for initiating a measurement.  Clears previous state and
   * sends a message prompting the user to select a task along with
   * a message that renders the TaskList component.
   */
  const handleStartMeasurement = () => {
    setSelectedTask(null);
    setCurrentStrategy(null);
    setSelectedBaselineIds([]);
    setBaselineSelectionMode(false);
    // Announce the start and deliver the tasks list
    pushMessages([
      { role: 'assistant', content: '以下是待测算任务列表，请选择要测算的项目：' },
      { role: 'task-list', content: null },
    ]);
  };

  /**
   * Called when the user selects a task from the TaskList.  Saves
   * the task, updates conversation history, and sends project info
   * and strategy options into the chat.
   */
  const handleSelectTask = (task) => {
    setSelectedTask(task);
    setCurrentStrategy(null);
    setSelectedBaselineIds([]);
    setBaselineSelectionMode(false);
    // Record in conversation history
    setConversationHistory((prev) => [
      ...prev,
      { title: task.name, timestamp: new Date().toLocaleString() },
    ]);
    // Send project info, history references and strategy options into chat
    pushMessages([
      { role: 'assistant', content: `已选择项目：${task.name}。以下为该项目基础信息：` },
      { role: 'project-info', content: null },
      {
        role: 'assistant',
        content: '以下为历史测算参考列表：请点击对应行的“参考并测算”按钮引用历史策略。',
      },
      { role: 'history-table', content: null },
      { role: 'assistant', content: '请选择测算策略：' },
      { role: 'strategy-list', content: null },
    ]);
  };

  /**
   * Called when the user selects a measurement strategy.  If the
   * strategy references baselineIds, the list of baselines is
   * automatically selected and baseline details are sent to the
   * chat.  Otherwise the user is prompted to pick baselines
   * manually.
   */
  const handleSelectStrategy = (strategy) => {
    setCurrentStrategy(strategy);
    if (strategy.baselineIds && strategy.baselineIds.length > 0) {
      setSelectedBaselineIds(strategy.baselineIds);
      setBaselineSelectionMode(false);
      pushMessages([
        { role: 'assistant', content: `已选择策略：${strategy.name}，以下为自动选择的基准任务：` },
        { role: 'baseline-details', content: null },
      ]);
    } else {
      // Custom selection mode
      setSelectedBaselineIds([]);
      setBaselineSelectionMode(true);
      pushMessages([
        { role: 'assistant', content: `已选择策略：${strategy.name}，请自定义选择基准任务：` },
        { role: 'baseline-list', content: null },
      ]);
    }
  };

  /**
   * Called when the user submits baseline selection.  Only used
   * when baselineSelectionMode is true (custom selection).  Sends
   * baseline details into the chat.
   */
  const handleConfirmBaselines = () => {
    if (selectedBaselineIds.length === 0) return;
    setBaselineSelectionMode(false);
    pushMessages([
      { role: 'assistant', content: '已确认选择的基准任务，以下为明细：' },
      { role: 'baseline-details', content: null },
    ]);
  };

  /**
   * Final submission handler.  Records the measurement result in
   * history and sends a confirmation message into the chat.  Resets
   * selection states but leaves conversation intact.
   */
  const handleSubmitMeasurement = () => {
    if (!selectedTask) return;
    const baselineNames = selectedBaselineIds.map(
      (id) => sampleBaseline.find((b) => b.id === id)?.name || ''
    );
    setMeasurementHistory((prev) => [
      ...prev,
      {
        title: `${selectedTask.name} - ${new Date().toLocaleString()}`,
        baseline: baselineNames,
        baselineIds: [...selectedBaselineIds],
      },
    ]);
    message.success('测算结果已提交');
    // Send confirmation and optionally prompt for another measurement
    pushMessages([
      { role: 'assistant', content: '测算结果已提交，感谢您的使用！如需再次测算，可点击“财务测算”按钮重新开始。' },
    ]);
    // Reset internal state but keep chat history
    setSelectedTask(null);
    setCurrentStrategy(null);
    setSelectedBaselineIds([]);
    setBaselineSelectionMode(false);
  };

  /**
   * Renders custom chat items based on the role property of each
   * message.  This function is passed to ProChat's chatItemRenderConfig.
   * It returns a React element for our custom roles or falls back to
   * defaultDom for plain text messages.
   */
  const contentRender = (item, dom, defaultDom) => {
    const role = item?.originData?.role;
    switch (role) {
      case 'task-list':
        return <TaskList tasks={sampleTasks} onSelect={handleSelectTask} />;
      case 'history-table': {
        // Map current tasks to history rows.  Each row uses a
        // strategyId matching the strategies array by index.  The
        // calculator is hard-coded to a sample value.  When a row is
        // referenced the corresponding strategy is selected.
        const historyRows = sampleTasks.map((t, index) => ({
          id: t.id,
          name: t.name,
          department: t.department,
          calculator: '刘晶晶',
          brand: t.brand,
          spec: t.spec,
          strategyId: strategies[index]
            ? strategies[index].id
            : strategies[strategies.length - 1].id,
        }));
        return (
          <HistoryTable
            history={historyRows}
            onReference={(record) => {
              const strategy = strategies.find(
                (s) => s.id === record.strategyId,
              );
              if (strategy) {
                handleSelectStrategy(strategy);
              }
            }}
          />
        );
      }
      case 'project-info':
        return <ProjectInfo project={projectInfo} />;
      case 'strategy-list':
        return (
          <StrategyList
            strategies={strategies}
            onSelect={handleSelectStrategy}
            currentStrategy={currentStrategy}
          />
        );
      case 'baseline-list':
        return (
          <BaselineList
            baselines={sampleBaseline}
            selectedIds={selectedBaselineIds}
            onChange={(ids) => setSelectedBaselineIds(ids)}
            onSubmit={handleConfirmBaselines}
          />
        );
      // baseline-details 展示已删除
      case 'baseline-details':
        return null;
      case 'baseline-history-details':
        return (
          <BaselineHistoryDetails baselineIds={item.baselineIds || []} />
        );
      default:
        return defaultDom;
    }
  };

  return (
    <Layout style={{ height: '100vh' }}>
      {/* Sidebar: conversation and measurement histories */}
      <Sider
        width={280}
        style={{ background: '#fff', borderRight: '1px solid #f0f0f0', padding: '16px 0' }}
      >
        <Title level={5} style={{ marginLeft: 16 }}>
          对话历史
        </Title>
        <List
          size="small"
          dataSource={conversationHistory}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta title={item.title} description={item.timestamp} />
            </List.Item>
          )}
        />
        <Title level={5} style={{ marginLeft: 16, marginTop: 24 }}>
          测算历史
        </Title>
        <List
          size="small"
          dataSource={measurementHistory}
          renderItem={(item) => (
            <List.Item
              style={{ cursor: 'pointer' }}
              onClick={() => {
                // When clicked, push messages showing history details
                pushMessages([
                  {
                    role: 'assistant',
                    content: `您查看了历史测算记录：${item.title}`,
                  },
                  {
                    role: 'baseline-history-details',
                    baselineIds: item.baselineIds,
                  },
                ]);
              }}
            >
              <List.Item.Meta
                title={item.title}
                description={item.baseline?.join('，')}
              />
            </List.Item>
          )}
        />
      </Sider>
      {/* Main area: header and chat */}
      <Layout style={{ display: 'flex', flexDirection: 'column' }}>
        <Header
          style={{
            background: '#fff',
            borderBottom: '1px solid #f0f0f0',
            padding: '0 16px',
          }}
        >
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Title level={4} style={{ margin: 0 }}>
              {selectedTask ? selectedTask.name : '新的会话'}
            </Title>
            <Button type="primary" onClick={handleStartMeasurement}>
              财务测算
            </Button>
          </Space>
        </Header>
        <Content
          style={{
            flex: 1,
            padding: 16,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <ProCard
            title="AI 对话"
            bordered
            headerBordered
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              <ProChat
                chats={chats}
                onChatsChange={(newChats) => {
                  // If the last message is from the user, generate a simple assistant reply.
                  const last = newChats[newChats.length - 1];
                  if (last && last.role === 'user') {
                    pushMessages([
                      {
                        role: 'assistant',
                        content: '该回复由示例生成，实际对话需接入后端。',
                      },
                    ]);
                  }
                  setChats(newChats);
                }}
                chatItemRenderConfig={{
                  contentRender,
                }}
                request={async (messages) => {
                  // Return an empty assistant message so ProChat does not display JSON.
                  return new Response(
                    JSON.stringify({
                      id: '1',
                      object: 'chat.completion',
                      created: Date.now(),
                      choices: [
                        {
                          index: 0,
                          message: {
                            role: 'assistant',
                            content: '',
                          },
                          finish_reason: 'stop',
                        },
                      ],
                    }),
                    {
                      status: 200,
                      headers: { 'Content-Type': 'application/json' },
                    },
                  );
                }}
                style={{ flex: 1 }}
              />
              <div ref={messagesEndRef} />
            </div>
          </ProCard>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AntProChatAIDemo;