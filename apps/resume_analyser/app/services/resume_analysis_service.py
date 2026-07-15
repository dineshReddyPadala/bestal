import base64
from uuid import uuid4

from app.core.config import Settings, get_settings
from app.core.exceptions import InvalidRequestError
from app.models.schemas import ResumeAnalysisResponse, ResumeAnalyzeRequest
from app.services.openai_agent import ResumeAnalysisAgent
from app.services.prompt_builder import PromptBuilder
from app.services.response_formatter import ResponseFormatter
from app.services.resume_parser import ResumeParser


class ResumeAnalysisService:
    def __init__(
        self,
        parser: ResumeParser | None = None,
        prompt_builder: PromptBuilder | None = None,
        agent: ResumeAnalysisAgent | None = None,
        settings: Settings | None = None,
    ):
        self._settings = settings or get_settings()
        self._parser = parser or ResumeParser()
        self._prompt_builder = prompt_builder or PromptBuilder()
        self._formatter = ResponseFormatter()
        self._agent = agent or ResumeAnalysisAgent(self._settings, self._formatter)

    async def analyze(self, request: ResumeAnalyzeRequest) -> ResumeAnalysisResponse:
        file_bytes = self._decode_base64(request.content)
        extension = self._parser.validate_file(request.file_name, request.mime_type)
        resume_text = self._parser.extract_text(file_bytes, extension)
        prompt = self._prompt_builder.build(resume_text)
        job_id = request.job_id or str(uuid4())
        result = self._agent.analyze(prompt, job_id=job_id)
        print("RESUME_OUTPUT:", result.model_dump(by_alias=True, mode="json"))
        return result

    def _decode_base64(self, content: str) -> bytes:
        if not content or not content.strip():
            raise InvalidRequestError("Base64 content is required.")

        encoded = content.strip()
        if "," in encoded and encoded.lower().startswith("data:"):
            encoded = encoded.split(",", 1)[1]

        try:
            return base64.b64decode(encoded, validate=True)
        except Exception as exc:
            raise InvalidRequestError("Invalid base64 content.") from exc
