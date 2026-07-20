class EvaluationError(Exception):
    """Base exception for evaluation analysis errors."""

    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class InvalidRequestError(EvaluationError):
    def __init__(self, message: str = "Invalid request payload."):
        super().__init__(message, status_code=400)


class UnsupportedFileTypeError(EvaluationError):
    def __init__(self, message: str = "Unsupported file type. Only PDF and DOCX are allowed."):
        super().__init__(message, status_code=415)


class DocumentExtractionError(EvaluationError):
    def __init__(self, message: str = "Failed to extract text from evaluation document."):
        super().__init__(message, status_code=422)


class OpenAIRequestError(EvaluationError):
    def __init__(self, message: str = "OpenAI request failed."):
        super().__init__(message, status_code=502)


class InvalidAIResponseError(EvaluationError):
    def __init__(self, message: str = "Failed to parse AI response after retry."):
        super().__init__(message, status_code=500)
