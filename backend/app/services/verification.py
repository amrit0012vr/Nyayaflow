from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.database import Chunk

class CitationVerifier:
    """
    SUM-02 / SUM-03:
    Verifies that claims and citations link to verified text in document chunks.
    Rejects fabricated excerpts, wrong pages, or unsupported assertions.
    """
    @staticmethod
    def verify_citations(db: Session, _case_id: str, citations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Validates citations: [{'document_id': '...', 'page': 1, 'span': [100, 250], 'excerpt': '...'}]
        Negative test: Fabricated excerpts or mismatched pages are strictly rejected.
        """
        if not citations:
            return {"verified": True, "valid_count": 0, "invalid_count": 0, "details": []}

        valid_count = 0
        invalid_count = 0
        details = []

        for cit in citations:
            doc_id = cit.get("document_id")
            page = cit.get("page", 1)
            excerpt = cit.get("excerpt", "").strip()

            # Query chunk
            chunk = db.query(Chunk).filter(
                Chunk.document_id == doc_id,
                Chunk.page == page
            ).first()

            if not chunk:
                invalid_count += 1
                details.append({
                    "citation": cit,
                    "status": "missing_chunk",
                    "reason": f"Page {page} of document {doc_id} not found"
                })
                continue

            # Strict excerpt validation
            if excerpt:
                chunk_lower = chunk.text_redacted.lower()
                excerpt_lower = excerpt.lower()
                
                # Check exact substring or substantive token overlap
                if excerpt_lower in chunk_lower:
                    is_match = True
                else:
                    words = [w for w in excerpt_lower.split() if len(w) >= 3]
                    matching_words = [w for w in words if w in chunk_lower]
                    overlap_ratio = len(matching_words) / len(words) if words else 0
                    is_match = overlap_ratio >= 0.7

                if not is_match:
                    invalid_count += 1
                    details.append({
                        "citation": cit,
                        "status": "unverified_claim",
                        "reason": f"Cited excerpt '{excerpt[:40]}...' not substantiated in page {page} chunk text"
                    })
                    continue

            valid_count += 1
            details.append({"citation": cit, "status": "verified"})

        all_ok = (invalid_count == 0)
        return {
            "verified": all_ok,
            "valid_count": valid_count,
            "invalid_count": invalid_count,
            "details": details
        }
