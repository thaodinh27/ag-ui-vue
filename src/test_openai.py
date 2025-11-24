# agent.py
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from ag_ui_langgraph import LangGraphAgent, add_langgraph_fastapi_endpoint
from fastapi import FastAPI
from dotenv import load_dotenv

load_dotenv()


# 1. Create LLM
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.2)


# 2. Create simple React-style agent
graph = create_agent(
    model=llm,
    tools=[]  # No tools for now
)

if __name__ == "__main__":
    inputs = {"messages": [{"role": "user", "content": "what is the weather in sf"}]}
    for chunk in graph.stream(inputs, stream_mode="updates"):
        print(chunk)
