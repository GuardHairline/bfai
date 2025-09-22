# 参考项目功能实现说明

## 功能描述
当用户在前端点击"参考并测算"按钮后，系统会自动生成一句与大模型的对话，格式为：
"帮我依据XXX项目生成待测算项目DE001-测试用的数据"

其中XXX是对应的点击的项目名称。

## 实现细节

### 1. 修改的组件

#### ReferenceProjects.jsx
- 添加了 `onReferenceProject` prop
- 修改了"参考并测算"按钮的点击事件，调用传入的回调函数

#### useChat.js
- 添加了 `generateReferenceProjectMessage` 函数
- 该函数接收项目对象，生成格式化的对话消息并推送到聊天记录中

#### ChatContentRenderer.jsx
- 添加了 `generateReferenceProjectMessage` prop
- 将函数传递给 TaskDetails 组件

#### TaskDetails.jsx
- 添加了 `onReferenceProject` prop
- 将回调函数传递给 ReferenceProjects 组件

#### App.js
- 从 useChat hook 中获取 `generateReferenceProjectMessage` 函数
- 将函数传递给 ChatContentRenderer 组件

### 2. 数据流
1. 用户点击"参考并测算"按钮
2. ReferenceProjects 组件调用 onReferenceProject 回调
3. 回调函数通过 TaskDetails -> ChatContentRenderer -> App.js 传递
4. App.js 中的 generateReferenceProjectMessage 函数被调用
5. 函数生成格式化的消息并推送到聊天记录中
6. 聊天界面显示新的用户消息，触发AI回复

### 3. 消息格式
生成的对话消息格式：
```
帮我依据[项目名称]项目生成待测算项目DE001-测试用的数据
```

例如：
```
帮我依据测试项目A项目生成待测算项目DE001-测试用的数据
```

## 测试验证
已通过单元测试验证消息生成功能的正确性。
