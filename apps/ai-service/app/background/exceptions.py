class BgvError(Exception):
    """Base exception for background verification analysis errors."""

    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class InvalidRequestError(BgvError):
    def __init__(self, message: str = "Invalid request payload."):
        super().__init__(message, status_code=400)


class UnsupportedFileTypeError(BgvError):
    def __init__(self, message: str = "Unsupported file type. Only PDF and DOCX are allowed."):
        super().__init__(message, status_code=415)


class DocumentExtractionError(BgvError):
    def __init__(self, message: str = "Failed to extract text from background verification document."):
        super().__init__(message, status_code=422)


class OpenAIRequestError(BgvError):
    def __init__(self, message: str = "OpenAI request failed."):
        super().__init__(message, status_code=502)


class InvalidAIResponseError(BgvError):
    def __init__(self, message: str = "Failed to parse AI response after retry."):
        super().__init__(message, status_code=500)
