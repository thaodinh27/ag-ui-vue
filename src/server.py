# agent.py
from langchain.agents import create_agent
# from langgraph.agui import AGUIServer
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

agent = LangGraphAgent(name="agent-101", graph=graph)

# 3. Create an AG-UI server wrapper
app = FastAPI(title="AG-UI Server")
add_langgraph_fastapi_endpoint(app, agent, "/")
# 4. Run the AG-UI server on port 8000
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8888)
