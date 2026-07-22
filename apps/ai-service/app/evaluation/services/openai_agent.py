from typing import TypedDict
from uuid import uuid4

from langchain_openai import ChatOpenAI
from langgraph.graph import END, StateGraph

from app.core.config import Settings
from app.evaluation.exceptions import InvalidAIResponseError, OpenAIRequestError
from app.evaluation.services.response_formatter import ResponseFormatter


class AgentState(TypedDict):
    prompt: str
    job_id: str
    candidate_id: str | None
    evaluation_id: str
    raw_response: str
    retry_count: int
    error: str | None


class EvaluationAgent:
    def __init__(self, settings: Settings, formatter: ResponseFormatter | None = None):
        self._settings = settings
        self._formatter = formatter or ResponseFormatter()
        self._llm = ChatOpenAI(
            api_key=settings.openai_api_key,
            model=settings.openai_model,
            temperature=0.2,
        )
        self._graph = self._build_graph()

    def evaluate(
        self,
        prompt: str,
        *,
        job_id: str,
        candidate_id: str | None = None,
        evaluation_id: str | None = None,
    ):
        try:
            final_state = self._graph.invoke(
                {
                    "prompt": prompt,
                    "job_id": job_id,
                    "candidate_id": candidate_id,
                    "evaluation_id": evaluation_id or str(uuid4()),
                    "raw_response": "",
                    "retry_count": 0,
                    "error": None,
                }
            )
        except OpenAIRequestError:
            raise
        except Exception as exc:
            raise OpenAIRequestError(str(exc)) from exc

        if final_state.get("error"):
            raise InvalidAIResponseError(final_state["error"])

        return self._formatter.parse(
            final_state["raw_response"],
            job_id=final_state["job_id"],
            candidate_id=final_state.get("candidate_id"),
            evaluation_id=final_state["evaluation_id"],
        )

    def _build_graph(self):
        graph = StateGraph(AgentState)
        graph.add_node("invoke_llm", self._invoke_llm)
        graph.add_node("validate_json", self._validate_json)
        graph.add_node("prepare_retry", self._prepare_retry)
        graph.set_entry_point("invoke_llm")
        graph.add_edge("invoke_llm", "validate_json")
        graph.add_conditional_edges(
            "validate_json",
            self._route_after_validation,
            {
                "retry": "prepare_retry",
                "finish": END,
            },
        )
        graph.add_edge("prepare_retry", "invoke_llm")
        return graph.compile()

    def _invoke_llm(self, state: AgentState) -> AgentState:
        try:
            response = self._llm.invoke(state["prompt"])
            content = (
                response.content if isinstance(response.content, str) else str(response.content)
            )
            return {**state, "raw_response": content, "error": None}
        except Exception as exc:
            raise OpenAIRequestError(str(exc)) from exc

    def _validate_json(self, state: AgentState) -> AgentState:
        try:
            self._formatter.parse(
                state["raw_response"],
                job_id=state["job_id"],
                candidate_id=state.get("candidate_id"),
                evaluation_id=state["evaluation_id"],
            )
            return {**state, "error": None}
        except Exception as exc:
            return {**state, "error": str(exc)}

    def _prepare_retry(self, state: AgentState) -> AgentState:
        return {
            **state,
            "retry_count": state.get("retry_count", 0) + 1,
            "error": None,
        }

    def _route_after_validation(self, state: AgentState) -> str:
        if state.get("error") and state.get("retry_count", 0) < 1:
            return "retry"
        return "finish"
