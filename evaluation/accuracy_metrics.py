from typing import List
import re


class AccuracyMetrics:
    """Calculate accuracy metrics for different features"""

    @staticmethod
    def calculate_coverage(original: str, processed: str) -> float:
        """Calculate what % of key information is retained"""
        orig_words = set(original.lower().split())
        proc_words = set(processed.lower().split())
        
        if not orig_words:
            return 0.0
        
        overlap = len(orig_words & proc_words)
        coverage = overlap / len(orig_words)
        return round(coverage, 3)

    @staticmethod
    def calculate_conciseness(original: str, processed: str) -> float:
        """Calculate reduction ratio"""
        if len(original) == 0:
            return 0.0
        
        reduction = 1 - (len(processed) / len(original))
        return round(max(0, reduction), 3)

    @staticmethod
    def calculate_coherence(text: str) -> float:
        """Simple coherence check: sentence structure quality"""
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if len(sentences) < 2:
            return 0.5
        
        lengths = [len(s.split()) for s in sentences]
        avg_length = sum(lengths) / len(lengths)
        
        if 5 <= avg_length <= 20:
            coherence = 1.0
        elif 3 <= avg_length <= 25:
            coherence = 0.8
        else:
            coherence = 0.5
        
        return round(coherence, 3)

    @staticmethod
    def calculate_keyword_preservation(original: str, processed: str, keywords: List[str]) -> float:
        """Check how many important keywords are preserved"""
        if not keywords:
            return 0.0
        
        found = sum(1 for kw in keywords if kw.lower() in processed.lower())
        preservation = found / len(keywords)
        return round(preservation, 3)

    @staticmethod
    def calculate_similarity_score(text1: str, text2: str) -> float:
        """Calculate similarity between two texts using simple word overlap"""
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        if not words1 or not words2:
            return 0.0
        
        overlap = len(words1 & words2)
        total = len(words1 | words2)
        
        if total == 0:
            return 0.0
        
        similarity = overlap / total
        return round(similarity, 3)
