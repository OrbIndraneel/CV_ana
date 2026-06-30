"""
__init__.py
Exports document parsers and segmentation engines.
"""

from app.nlp.parsers.pdf_parser import parse_pdf
from app.nlp.parsers.docx_parser import parse_docx
from app.nlp.parsers.section_segmenter import segment_sections

__all__ = ["parse_pdf", "parse_docx", "segment_sections"]
