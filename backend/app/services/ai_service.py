from openai import OpenAI
import httpx

class AIService:
    def __init__(self, api_base_url, model_name):
        self.client = OpenAI(
            base_url=api_base_url,
            api_key='ollama',
            http_client=httpx.Client(
                proxies={"http://": None, "https://": None},
                timeout=120.0, # Increase timeout for streaming
            ),
        )
        self.model_name = model_name

    def get_streaming_chat_completion(self, user_message, system_prompt="You are a helpful assistant."):
        try:
            stream = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message},
                ],
                temperature=0.0,
                stream=True,
            )
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            print(f"Error communicating with Ollama: {type(e).__name__}: {e}")
            yield "对不起，我在连接AI模型时遇到了一个网络问题。请检查Ollama服务是否正在运行，或者网络代理设置是否正确。"
