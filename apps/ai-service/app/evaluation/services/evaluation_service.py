import base64
from uuid import uuid4

from app.core.config import Settings, get_settings
from app.evaluation.exceptions import InvalidRequestError
from app.evaluation.models.schemas import EvaluateRequest, EvaluationResponse
from app.evaluation.services.document_parser import DocumentParser
from app.evaluation.services.openai_agent import EvaluationAgent
from app.evaluation.services.prompt_builder import PromptBuilder
from app.evaluation.services.response_formatter import ResponseFormatter


class EvaluationService:
    def __init__(
        self,
        parser: DocumentParser | None = None,
        prompt_builder: PromptBuilder | None = None,
        agent: EvaluationAgent | None = None,
        settings: Settings | None = None,
    ):
        self._settings = settings or get_settings()
        self._parser = parser or DocumentParser()
        self._prompt_builder = prompt_builder or PromptBuilder()
        self._formatter = ResponseFormatter()
        self._agent = agent or EvaluationAgent(self._settings, self._formatter)

    async def evaluate(self, request: EvaluateRequest) -> EvaluationResponse:
        file_bytes = self._decode_base64(request.content)
        extension = self._parser.validate_file(request.file_name, request.mime_type)
        document_text = self._parser.extract_text(file_bytes, extension)
        prompt = self._prompt_builder.build(document_text)
        job_id = request.job_id or str(uuid4())
        result = self._agent.evaluate(
            prompt,
            job_id=job_id,
            candidate_id=request.candidate_id,
        )
        print("EVALUATION_OUTPUT:", result.model_dump(mode="json"))
        return result

    def _decode_base64(self, content: str) -> bytes:
        if not content or not content.strip():
            raise InvalidRequestError("Base64 content is required.")

        encoded = content.strip()
        if "," in encoded and encoded.lower().startswith("data:"):
            encoded = encoded.split(",", 1)[1]

        # Node Buffer.toString('base64') is usually padded; tolerate missing padding.
        missing = len(encoded) % 4
        if missing:
            encoded += "=" * (4 - missing)

        try:
            # validate=False: some transports insert whitespace / newlines
            return base64.b64decode(encoded, validate=False)
        except Exception as exc:
            raise InvalidRequestError("Invalid base64 content.") from exc
