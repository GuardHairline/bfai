/*
 * This file holds static sample data for the Business Finance AI demo.  When
 * connecting to a backend, you can remove these definitions and instead
 * import your data from API calls.  Keeping all mock data in one place
 * makes it easy to switch to real data later.
 */

// Pending measurement tasks.  Each represents a project requiring
// financial estimation.  Replace with your own data when integrating
// with a backend.
export const sampleTasks = [
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

// Base project information that is displayed when a task is selected.  In
// a real implementation, fetch these details based on the selected
// task.
export const projectInfo = {
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

// Baseline tasks library.  Each entry describes a first-level task
// available for selection.  Use your own baseline library here.
export const sampleBaseline = [
  {
    id: 1,
    powerConfig: 'DE09（4B15E+DHT - 3+PHEV+国内专属）',
    name: '计算数模质量质心',
    type: '借用',
    matter: '测试、完全借用',
    hours: 40,
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

// Strategy suggestions available for selection.  Each strategy lists
// baselineIds that will be automatically selected when the strategy
// is chosen.  A strategy with an empty baselineIds array indicates
// that the user should select baseline tasks manually.
export const strategies = [
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

// Predefined measurement history.  Each entry includes a title and
// baselineIds, used to retrieve baseline details when viewing the
// history.  Replace with real history from your backend.
export const initialMeasurementHistory = [
  {
    title: '南京汽车测试项目 - 示例',
    baseline: [
      '计算数模质量质心',
      '全尺寸全功能检查表',
      '试验车辆跟踪及问题处理',
    ],
    baselineIds: [1, 2, 3],
  },
  {
    title: 'ES11中东版-项目复测 - 示例',
    baseline: [
      'ET准入成本达成测量',
      'SE议题研讨',
      '标杆专利检索申请及报告确认',
    ],
    baselineIds: [4, 5, 6],
  },
];