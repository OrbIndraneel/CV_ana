import json
import os
from typing import List, Dict, Any

AI_KEYWORDS = [
    "python", "embeddings", "retrieval", "sentence-transformers", "openai embeddings", 
    "bge", "e5", "pinecone", "weaviate", "qdrant", "milvus", "opensearch", "elasticsearch", 
    "faiss", "ndcg", "mrr", "map", "a/b testing", "ab testing", "llm", "rag", "ranking"
]

CONSULTING_FIRMS = [
    "tcs", "infosys", "wipro", "accenture", "cognizant", "capgemini", "tata consultancy"
]

class ChallengeService:
    @staticmethod
    def score_candidate(data: Dict[str, Any]) -> tuple[float, str]:
        score = 0.5
        
        # 1. Redrob Signals
        signals = data.get("redrob_signals", {})
        response_rate = signals.get("recruiter_response_rate", 0.0)
        
        # 2. Experience
        profile = data.get("profile", {})
        yoe = profile.get("years_of_experience", 0)
        if 4 <= yoe <= 12:
            score += 0.1
        elif yoe < 3 or yoe > 15:
            score -= 0.1
            
        title = profile.get("current_title", "").lower()
        if any(k in title for k in ["marketing", "hr ", "sales", "accountant", "customer", "graphic", "civil", "operations"]):
            score -= 0.3
            
        if any(k in title for k in ["software", "ai ", "ml ", "machine learning", "data", "engineer", "applied"]):
            score += 0.2
            
        # 3. Skills Check
        skill_matches = 0
        for s in data.get("skills", []):
            s_name = s.get("name", "").lower()
            if any(kw in s_name for kw in AI_KEYWORDS):
                skill_matches += 1
        
        score += min(0.2, (skill_matches * 0.05))
        
        # 4. Career History
        history = data.get("career_history", [])
        only_consulting = True
        has_product_exp = False
        for job in history:
            company = job.get("company", "").lower()
            desc = job.get("description", "").lower()
            
            if not any(c in company for c in CONSULTING_FIRMS):
                only_consulting = False
                
            if any(kw in desc for kw in ["recommendation", "search", "ranking", "retrieval", "production"]):
                has_product_exp = True
                
        if history and only_consulting:
            score -= 0.2
            
        if has_product_exp:
            score += 0.15
            
        # Combine signals
        final_score = score * (0.3 + (0.7 * response_rate))
        final_score = max(0.001, min(0.999, final_score))
        
        title_short = title.title() if title else "Candidate"
        reason = f"{title_short} with {yoe} yrs; {skill_matches} AI core skills; response rate {response_rate:.2f}."
        if has_product_exp:
            reason = reason.replace("skills;", "skills; Built Product;")
        
        return final_score, reason

    @staticmethod
    def process_challenge_file(file_path: str) -> List[Dict[str, Any]]:
        top_candidates = []
        
        with open(file_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                data = json.loads(line)
                cid = data.get("candidate_id")
                if not cid:
                    continue
                
                score, reason = ChallengeService.score_candidate(data)
                top_candidates.append((-score, cid, reason))
                
        # Sort best score first
        top_candidates.sort()
        
        top_100 = top_candidates[:100]
        
        results = []
        for rank, (neg_score, cid, reason) in enumerate(top_100, 1):
            score = -neg_score
            results.append({
                "candidate_id": cid,
                "rank": rank,
                "score": f"{score:.4f}",
                "reasoning": reason
            })
            
        return results
