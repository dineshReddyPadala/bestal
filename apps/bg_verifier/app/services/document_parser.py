import io
from pathlib import Path

import pdfplumber
from docx import Document

from app.core.exceptions import DocumentExtractionError, UnsupportedFileTypeError

SUPPORTED_EXTENSIONS = {".pdf", ".docx"}
SUPPORTED_CONTENT_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


class DocumentParser:
    def validate_file(self, filename: str | None, content_type: str | None) -> str:
        if not filename:
            raise UnsupportedFileTypeError("Background verification file is required.")

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
        except UnsupportedFileTypeError:
            raise
        except Exception as exc:
            raise DocumentExtractionError() from exc

    def _extract_from_pdf(self, file_bytes: bytes) -> str:
        pages: list[str] = []
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    pages.append(text.strip())

        document_text = "\n\n".join(pages).strip()
        if not document_text:
            raise DocumentExtractionError("No readable text found in PDF document.")
        return document_text

    def _extract_from_docx(self, file_bytes: bytes) -> str:
        document = Document(io.BytesIO(file_bytes))
        paragraphs = [
            paragraph.text.strip() for paragraph in document.paragraphs if paragraph.text.strip()
        ]

        document_text = "\n".join(paragraphs).strip()
        if not document_text:
            raise DocumentExtractionError("No readable text found in DOCX document.")
        return document_text
