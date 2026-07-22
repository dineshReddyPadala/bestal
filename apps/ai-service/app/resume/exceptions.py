class ResumeAnalysisError(Exception):
    """Base exception for resume analysis errors."""

    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class InvalidRequestError(ResumeAnalysisError):
    def __init__(self, message: str = "Invalid request payload."):
        super().__init__(message, status_code=400)


class UnsupportedFileTypeError(ResumeAnalysisError):
    def __init__(self, message: str = "Unsupported file type. Only PDF and DOCX are allowed."):
        super().__init__(message, status_code=415)


class ResumeExtractionError(ResumeAnalysisError):
    def __init__(self, message: str = "Failed to extract text from resume."):
        super().__init__(message, status_code=422)


class OpenAIRequestError(ResumeAnalysisError):
    def __init__(self, message: str = "OpenAI request failed."):
        super().__init__(message, status_code=502)


class InvalidAIResponseError(ResumeAnalysisError):
    def __init__(self, message: str = "Failed to parse AI response after retry."):
        super().__init__(message, status_code=500)
