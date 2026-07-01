import os
import tempfile
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.services.challenge_service import ChallengeService

router = APIRouter()

@router.post(
    "/upload",
    status_code=status.HTTP_200_OK,
    summary="Process AI Challenge dataset",
    description="Uploads a JSONL file containing candidates and returns the top 100 matched candidates."
)
async def process_challenge(file: UploadFile = File(...)):
    if not file.filename.endswith(".jsonl"):
        raise HTTPException(status_code=400, detail="Only .jsonl files are supported")

    # Save to a temporary file for the synchronous heuristic processor to read
    fd, path = tempfile.mkstemp(suffix=".jsonl")
    try:
        with os.fdopen(fd, 'wb') as f:
            while chunk := await file.read(1024 * 1024 * 10):  # 10MB chunks
                f.write(chunk)
                
        # Process the temporary file
        results = ChallengeService.process_challenge_file(path)
        return {"top_candidates": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up
        if os.path.exists(path):
            os.remove(path)
