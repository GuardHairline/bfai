# 业财一体化智能测算助手 - API 文档

本文档旨在详细说明“业财一体化智能测算助手”项目前后端交互所使用的 API 接口。所有接口的统一前缀为 `/api/v1/bfa`。

---

## 目录

1.  [认证与用户](#认证与用户)
2.  [任务管理](#任务管理)
3.  [历史记录](#历史记录)
4.  [AI 聊天](#ai-聊天)
5.  [测算流程](#测算流程)

---

## 1. 认证与用户

### 获取所有可选用户列表

-   **Endpoint**: `/persons`
-   **Method**: `GET`
-   **描述**: 获取系统中所有可用于登录的接口人列表。
-   **Query Parameters**: 无
-   **Request Body**: 无
-   **Success Response (200 OK)**:
    ```json
    {
      "status": "success",
      "data": [
        {
          "id": 1,
          "name": "张三",
          "department": "财务部"
        },
        {
          "id": 2,
          "name": "李四",
          "department": "研发部"
        }
      ]
    }
    ```

---

## 2. 任务管理

### 获取任务列表

-   **Endpoint**: `/tasks`
-   **Method**: `GET`
-   **描述**: 获取待办任务列表。如果提供了 `person_id`，则返回该用户的专属任务列表；否则返回所有任务。
-   **Query Parameters**:
    -   `person_id` (optional, integer): 用户 ID。
-   **Request Body**: 无
-   **Success Response (200 OK)**:
    ```json
    {
      "status": "success",
      "data": [
        {
          "id": 101,
          "name": "项目A - 2025年度预算测算",
          "task_person_id": 1,
          "deadline": "2025-10-31"
        }
      ]
    }
    ```

### 获取特定任务详情

-   **Endpoint**: `/tasks/<task_id>`
-   **Method**: `GET`
-   **描述**: 根据任务 ID 获取该任务的详细基础信息。
-   **URL Parameters**:
    -   `task_id` (required, string/integer): 任务的唯一标识符。
-   **Request Body**: 无
-   **Success Response (200 OK)**:
    ```json
    {
      "status": "success",
      "data": {
        "id": 101,
        "name": "项目A - 2025年度预算测算",
        "creator": "王五",
        "create_time": "2025-09-01",
        "details": "..."
      }
    }
    ```

---

## 3. 历史记录

### 获取通用历史测算项目

-   **Endpoint**: `/history`
-   **Method**: `GET`
-   **描述**: 获取一个通用的、可供参考的历史测算项目列表。
-   **Query Parameters**: 无
-   **Request Body**: 无
-   **Success Response (200 OK)**:
    ```json
    {
      "status": "success",
      "data": [
        {
          "id": 201,
          "name": "项目B - 2024年度历史测算",
          "completion_date": "2024-11-15"
        }
      ]
    }
    ```

### (已定义但前端未使用) 获取特定任务的历史参考

-   **Endpoint**: `/tasks/<task_id>/historical-projects`
-   **Method**: `GET`
-   **描述**: 根据任务 ID，获取与该任务相关的、更具针对性的历史参考项目列表。
-   **URL Parameters**:
    -   `task_id` (required, integer): 任务的唯一标识符。
-   **Request Body**: 无

---

## 4. AI 聊天

### 发送消息并获取流式回复

-   **Endpoint**: `/chat`
-   **Method**: `POST`
-   **描述**: 向后端 AI 服务发送一条用户消息，并以流式（streaming）方式接收助手的回复。
-   **Request Body**:
    ```json
    {
      "message": "你好，请帮我介绍一下这个项目。"
    }
    ```
-   **Success Response (200 OK)**:
    -   响应体是一个 text/event-stream。
    -   前端会持续接收到数据块，数据块中可能包含由 `<think>` 和 `</think>` 标签包裹的思考过程文本。

---

## 5. 测算流程 (已定义但前端未使用)

以下接口已在后端定义，但当前版本的前端尚未调用，主要用于未来的测算、修改、校验和提交流程。

### 生成测算结果

-   **Endpoint**: `/tasks/<task_id>/calculate`
-   **Method**: `POST`
-   **描述**: 基于用户选择的基准和策略，为特定任务生成初步的测算结果。
-   **URL Parameters**:
    -   `task_id` (required, integer): 任务 ID。
-   **Request Body**:
    ```json
    {
      "strategy_id": 1,
      "baseline_ids": [10, 12, 15]
    }
    ```

### 修改测算结果

-   **Endpoint**: `/calculations/modify`
-   **Method**: `POST`
-   **描述**: 用户在前端对生成的测算结果进行手动调整和修改。
-   **Request Body**:
    ```json
    {
      "calculation_id": 301,
      "modifications": [
        { "item_id": "A1", "new_value": 15000 },
        { "item_id": "B2", "new_value": 9800 }
      ]
    }
    ```

### 校验测算结果

-   **Endpoint**: `/calculations/validate`
-   **Method**: `POST`
-   **描述**: 在提交前，对测算结果进行业务规则和逻辑校验。
-   **Request Body**:
    ```json
    {
      "calculation_id": 301
    }
    ```

### 提交最终测算

-   **Endpoint**: `/tasks/<task_id>/submit`
-   **Method**: `POST`
-   **描述**: 将最终确认的测算结果提交，完成整个测算任务。
-   **URL Parameters**:
    -   `task_id` (required, integer): 任务 ID。
-   **Request Body**:
    ```json
    {
      "calculation_id": 301,
      "comments": "已与相关部门确认无误。"
    }
    ```
