# BusinessFinanceAI 项目说明

## 项目简介

BusinessFinanceAI 是一个基于 React 和 Ant Design Pro 构建的业务财务测算助手示例。

## 环境要求

- Node.js ≥ 14.x
- npm 包管理器
- ant-design-pro

## 安装与启动

克隆项目代码或将代码拷贝到本地目录。然后在项目根目录执行依赖安装并启动开发服务：

```bash
npm install

npm start

```

默认情况下应用将运行在 http://localhost:3000，浏览器打开即可访问。

## 目录结构说明（主要文件）

主要代码位于 `src/`，示例结构如下：

- src/App.js：根组件，负责布局与全局状态（会话、测算状态、模型切换等）。
- src/index.js：应用入口，加载样式并渲染根组件。
- src/components/：存放 UI 子组件：
  - HistorySidebar.jsx：左侧栏，包含会话历史、测算历史、新建会话和登录/退出。
  - HeaderBar.jsx：顶部栏，显示会话标题与模型切换下拉。
  - ChatArea.jsx：封装 ProChat 的对话区实现。
  - MeasurementEntry.jsx：新建会话时的测算入口卡片。
  - TaskList.jsx：代办任务列表，支持选择项目。
  - ProjectInfo.jsx：项目基础信息描述列表。
  - HistoryTable.jsx：历史测算参考表格，支持“参考并测算”操作。
  - StrategyList.jsx：测算策略列表（历史/自定义）。
  - BaselineList.jsx：基准任务选择表（多选、提交）。
  - BaselineDetails.jsx：基准任务及月度明细表（可编辑工时与月数，展示统计并提交）。
  - BaselineHistoryDetails.jsx：历史测算的只读基准明细表。
- src/data/sampleData.js：静态示例数据（待测任务、项目信息、基准库、策略、初始历史），便于调试与演示。

## 功能概览

- 会话管理：左侧栏显示会话与测算历史，可新建会话或查看历史条目。
- 模型选择：顶部模型切换下拉，用于选择不同的 AI 模型或后端策略。
- AI 对话区：
  - 新会话显示“财务测算”入口卡片，点击开始选择代办任务。
  - 选择任务后显示项目基础信息、历史参考与策略按钮。
  - 选择历史策略会自动展示对应基准任务明细；自定义策略允许手动勾选基准任务。
  - BaselineDetails 支持编辑工时与月数，展示统计信息（任务数、总工时、动力配置种类与月数汇总），并提交测算结果。
- 自动滚动与输入框固定：对话区使用 flex 布局与 100% 高度，使消息列表自动扩展，输入框固定在底部并随新消息自动滚到底部。
- 静态数据管理：示例数据集中在 `sampleData.js`，便于调试与替换。
