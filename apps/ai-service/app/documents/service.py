import base64

from app.documents.schemas import ExtractTextRequest, ExtractTextResponse
from app.evaluation.exceptions import DocumentExtractionError, EvaluationError, InvalidRequestError
from app.evaluation.services.document_parser import DocumentParser


class DocumentTextService:
    def __init__(self, parser: DocumentParser | None = None):
        self._parser = parser or DocumentParser()

    def extract_text(self, request: ExtractTextRequest) -> ExtractTextResponse:
        file_bytes = self._decode_base64(request.content)
        extension = self._parser.validate_file(request.file_name, request.mime_type)
        if extension == ".pdf" or request.file_name.lower().endswith(".pdf"):
            extension = ".pdf"
        document_text = self._parser.extract_text(file_bytes, extension)
        return ExtractTextResponse(text=document_text)

    def _decode_base64(self, content: str) -> bytes:
        if not content or not content.strip():
            raise InvalidRequestError("Base64 content is required.")

        encoded = content.strip()
        if "," in encoded and encoded.lower().startswith("data:"):
            encoded = encoded.split(",", 1)[1]

        missing = len(encoded) % 4
        if missing:
            encoded += "=" * (4 - missing)

        try:
            return base64.b64decode(encoded, validate=False)
        except Exception as exc:
            raise InvalidRequestError("Invalid base64 content.") from exc
