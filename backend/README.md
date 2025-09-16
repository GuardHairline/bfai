# BFAI - 后端服务

## 项目简介

本项目是“业财智能测算助手”的后端部分，基于 Flask 框架开发。它为前端应用提供了处理业务逻辑、数据交互以及与大语言模型（LLM）集成的核心API服务。

后端主要负责：
-   连接并操作 MySQL 数据库，管理测算任务、用户信息等数据。
-   提供 RESTful API，用于获取待办任务、项目详情、历史记录和登录人员列表。
-   集成并调用本地部署的 Ollama 大语言模型（例如 `qwen3:4b`），为前端提供流式AI对话能力。
-   通过 Flasgger 自动生成并提供交互式的 API 文档。

## 技术栈

-   **框架**: Flask
-   **数据库 ORM**: Flask-SQLAlchemy
-   **数据库**: MySQL
-   **数据库驱动**: PyMySQL
-   **API文档**: Flasgger (Swagger UI)
-   **LLM 对接**: OpenAI Python SDK (用于连接 Ollama)
-   **Web 服务器**: Werkzeug (Flask内置)

## 环境准备

在开始之前，请确保您的开发环境中已安装以下软件：

-   Python (推荐版本 3.8+)
-   pip (Python 包管理器)
-   MySQL 数据库
-   Ollama (及已拉取的 `qwen:4b` 模型)

## 安装与配置

1.  **克隆仓库与安装依赖**
    ```bash
    git clone https://github.com/GuardHairline/bfai.git
    cd bfai/backend

    (创建虚拟环境)

    pip install -r requirements.txt
    ```

2.  **配置数据库**
    -   确保您的 MySQL 服务正在运行。
    -   项目数据库名为 `testbudget` 。
    -   打开 `backend/app/config/config.py` 文件，修改 `SQLALCHEMY_DATABASE_URI` 以匹配您的 MySQL 用户名、密码和地址。
    ```python
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://<你的用户名>:<你的密码>@<主机地址>:<端口>/testbudget'
    ```

3.  **配置 Ollama**
    -   确保本地 Ollama 服务正在运行。
    -   通过以下命令拉取所需的模型：
        ```bash
        ollama pull qwen3:4b
        ```
    -   如有需要，可以在 `backend/app/config/config.py` 中修改 `OLLAMA_API_BASE_URL` 和 `OLLAMA_MODEL`。

## 运行项目

完成上述步骤后，在 `backend` 目录下运行以下命令启动后端服务：

```bash
python run.py
```

服务默认将在 `http://127.0.0.1:5000` 上启动。

启动成功后，与前端应用（默认运行在 `localhost:3000`）的API代理将自动生效。

## API 文档

项目集成了 Flasgger，启动服务后，您可以访问以下地址查看交互式 API 文档：

[http://127.0.0.1:5000/apidocs/](http://127.0.0.1:5000/apidocs/)

## 主要 API 端点

-   `GET /api/v1/bfa/tasks`: 获取待办任务列表。
    -   可选参数 `person_id`: 根据人员ID筛选任务。
-   `GET /api/v1/bfa/tasks/<task_id>`: 根据任务ID获取项目详情。
-   `GET /api/v1/bfa/persons`: 获取所有可登录的接口人列表。
-   `POST /api/v1/bfa/chat`: 发送消息给 AI 模型并获取流式回复。
-   `GET /api/v1/bfa/history`: 获取历史测算项目列表。

## 项目结构

```
backend/
├── app/
│   ├── config/       # 配置文件
│   ├── db/           # 数据库实例
│   ├── modules/
│   │   └── bfa/      # BFA 核心业务模块 (models, controller, route)
│   ├── services/     # 外部服务 (如 AI Service)
│   ├── __init__.py
│   ├── app.py        # Flask App 工厂函数
│   └── initialize_functions.py # 初始化函数
├── tests/            # 测试用例
├── venv/             # Python 虚拟环境
├── .gitignore
├── README.md         # 本文档
├── requirements.txt  # Python 依赖
└── run.py            # 项目启动脚本
```
