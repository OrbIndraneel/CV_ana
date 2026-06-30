"""
pdf_parser.py
PDF parser module using pdfplumber to handle multi-column layouts and metadata checks.
Scans for layout elements (tables, drawings) that present risks to standard ATS parsers.
"""

import io
import logging
from typing import Any, Dict
import pdfplumber

from app.core.exceptions import NLPProcessingException
from app.nlp.utils.text_cleaner import clean_text

logger = logging.getLogger(__name__)


def parse_pdf(file_bytes: bytes) -> Dict[str, Any]:
    """
    Parse text from a PDF binary stream.
    Detects ATS-risks such as tables, drawings/rectangles (potentially text boxes),
    and whether selectable text is present (scanned document check).
    """
    if not file_bytes:
        raise NLPProcessingException("Empty file bytes provided for PDF parsing.")

    raw_text_parts = []
    tables_detected = False
    drawings_detected = False
    has_selectable_text = False
    page_count = 0

    try:
        # Open PDF from in-memory bytes
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            page_count = len(pdf.pages)
            logger.debug(f"Starting PDF parse. Page count: {page_count}")

            for i, page in enumerate(pdf.pages):
                # 1. Check for table elements
                tables = page.find_tables()
                if tables:
                    tables_detected = True
                    logger.debug(f"Tables detected on page {i + 1}")

                # 2. Check for drawings or rectangles (indicates lines, borders, or text boxes)
                if len(page.rects) > 0 or len(page.images) > 0:
                    drawings_detected = True
                    logger.debug(f"Drawings or images detected on page {i + 1}")

                # 3. Extract text
                page_text = page.extract_text()
                if page_text and page_text.strip():
                    has_selectable_text = True
                    raw_text_parts.append(page_text)

        # Combine text from all pages
        full_text = "\n".join(raw_text_parts)
        cleaned = clean_text(full_text)

        # If we have pages but absolutely no text was extracted, it is likely a scanned image
        is_scanned = page_count > 0 and not has_selectable_text

        result = {
            "raw_text": cleaned,
            "metadata": {
                "tables_detected": tables_detected,
                "has_text_boxes": drawings_detected,
                "is_scanned": is_scanned,
                "page_count": page_count,
                "file_type": "pdf"
            }
        }
        logger.info(f"PDF parsed successfully. Selectable text found: {has_selectable_text}. Pages: {page_count}")
        return result

    except Exception as e:
        logger.error(f"Error parsing PDF file: {e}", exc_info=True)
        raise NLPProcessingException(
            detail=f"An error occurred while parsing the PDF document: {str(e)}",
            code="PDF_PARSING_FAILED"
        ) from e
