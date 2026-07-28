import io
from pathlib import Path

import pdfplumber
from docx import Document

from app.resume.exceptions import ResumeExtractionError, UnsupportedFileTypeError

SUPPORTED_EXTENSIONS = {".pdf", ".docx"}
SUPPORTED_CONTENT_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


class ResumeParser:
    def validate_file(self, filename: str | None, content_type: str | None) -> str:
        if not filename:
            raise UnsupportedFileTypeError("Resume file is required.")

        extension = Path(filename).suffix.lower()
        if extension not in SUPPORTED_EXTENSIONS:
            raise UnsupportedFileTypeError()

        if content_type and content_type not in SUPPORTED_CONTENT_TYPES:
            raise UnsupportedFileTypeError()

        return extension

    def extract_text(self, file_bytes: bytes, extension: str) -> str:
        try:
            if extension == ".pdf":
                return self._extract_from_pdf(file_bytes)
            return self._extract_from_docx(file_bytes)
        except (ResumeExtractionError, UnsupportedFileTypeError):
            raise
        except Exception as exc:
            raise ResumeExtractionError(
                f"Failed to extract text from resume: {exc}"
            ) from exc

    def _extract_from_pdf(self, file_bytes: bytes) -> str:
        pages: list[str] = []
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    pages.append(text.strip())

        resume_text = "\n\n".join(pages).strip()
        if not resume_text:
            raise ResumeExtractionError("No readable text found in PDF resume.")
        return resume_text

    def _extract_from_docx(self, file_bytes: bytes) -> str:
        document = Document(io.BytesIO(file_bytes))
        paragraphs = [paragraph.text.strip() for paragraph in document.paragraphs if paragraph.text.strip()]

        resume_text = "\n".join(paragraphs).strip()
        if not resume_text:
            raise ResumeExtractionError("No readable text found in DOCX resume.")
        return resume_text
