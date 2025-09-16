# BFAI - ��˷���

## ��Ŀ���

����Ŀ�ǡ�ҵ�����ܲ������֡��ĺ�˲��֣����� Flask ��ܿ�������Ϊǰ��Ӧ���ṩ�˴���ҵ���߼������ݽ����Լ��������ģ�ͣ�LLM�����ɵĺ���API����

�����Ҫ����
-   ���Ӳ����� MySQL ���ݿ⣬������������û���Ϣ�����ݡ�
-   �ṩ RESTful API�����ڻ�ȡ����������Ŀ���顢��ʷ��¼�͵�¼��Ա�б�
-   ���ɲ����ñ��ز���� Ollama ������ģ�ͣ����� `qwen3:4b`����Ϊǰ���ṩ��ʽAI�Ի�������
-   ͨ�� Flasgger �Զ����ɲ��ṩ����ʽ�� API �ĵ���

## ����ջ

-   **���**: Flask
-   **���ݿ� ORM**: Flask-SQLAlchemy
-   **���ݿ�**: MySQL
-   **���ݿ�����**: PyMySQL
-   **API�ĵ�**: Flasgger (Swagger UI)
-   **LLM �Խ�**: OpenAI Python SDK (�������� Ollama)
-   **Web ������**: Werkzeug (Flask����)

## ����׼��

�ڿ�ʼ֮ǰ����ȷ�����Ŀ����������Ѱ�װ���������

-   Python (�Ƽ��汾 3.8+)
-   pip (Python ��������)
-   MySQL ���ݿ�
-   Ollama (������ȡ�� `qwen:4b` ģ��)

## ��װ������

1.  **��¡�ֿ��밲װ����**
    ```bash
    git clone https://github.com/GuardHairline/bfai.git
    cd bfai/backend

    (�������⻷��)

    pip install -r requirements.txt
    ```

2.  **�������ݿ�**
    -   ȷ������ MySQL �����������С�
    -   ��Ŀ���ݿ���Ϊ `testbudget` ��
    -   �� `backend/app/config/config.py` �ļ����޸� `SQLALCHEMY_DATABASE_URI` ��ƥ������ MySQL �û���������͵�ַ��
    ```python
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://<����û���>:<�������>@<������ַ>:<�˿�>/testbudget'
    ```

3.  **���� Ollama**
    -   ȷ������ Ollama �����������С�
    -   ͨ������������ȡ�����ģ�ͣ�
        ```bash
        ollama pull qwen3:4b
        ```
    -   ������Ҫ�������� `backend/app/config/config.py` ���޸� `OLLAMA_API_BASE_URL` �� `OLLAMA_MODEL`��

## ������Ŀ

�������������� `backend` Ŀ¼��������������������˷���

```bash
python run.py
```

����Ĭ�Ͻ��� `http://127.0.0.1:5000` ��������

�����ɹ�����ǰ��Ӧ�ã�Ĭ�������� `localhost:3000`����API�����Զ���Ч��

## API �ĵ�

��Ŀ������ Flasgger����������������Է������µ�ַ�鿴����ʽ API �ĵ���

[http://127.0.0.1:5000/apidocs/](http://127.0.0.1:5000/apidocs/)

## ��Ҫ API �˵�

-   `GET /api/v1/bfa/tasks`: ��ȡ���������б�
    -   ��ѡ���� `person_id`: ������ԱIDɸѡ����
-   `GET /api/v1/bfa/tasks/<task_id>`: ��������ID��ȡ��Ŀ���顣
-   `GET /api/v1/bfa/persons`: ��ȡ���пɵ�¼�Ľӿ����б�
-   `POST /api/v1/bfa/chat`: ������Ϣ�� AI ģ�Ͳ���ȡ��ʽ�ظ���
-   `GET /api/v1/bfa/history`: ��ȡ��ʷ������Ŀ�б�

## ��Ŀ�ṹ

```
backend/
������ app/
��   ������ config/       # �����ļ�
��   ������ db/           # ���ݿ�ʵ��
��   ������ modules/
��   ��   ������ bfa/      # BFA ����ҵ��ģ�� (models, controller, route)
��   ������ services/     # �ⲿ���� (�� AI Service)
��   ������ __init__.py
��   ������ app.py        # Flask App ��������
��   ������ initialize_functions.py # ��ʼ������
������ tests/            # ��������
������ venv/             # Python ���⻷��
������ .gitignore
������ README.md         # ���ĵ�
������ requirements.txt  # Python ����
������ run.py            # ��Ŀ�����ű�
```
