import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'ai-service')))

from chains.stylization_chain import stylize_text
from accuracy_metrics import AccuracyMetrics


class TestStylizationAccuracy(unittest.TestCase):
    """Test accuracy of text stylization"""

    def setUp(self):
        self.metrics = AccuracyMetrics()
        
        self.source_text = """
        Behavioral economics shows that people don't always act rationally. Traditional economics assumes 
        people maximize utility, but real people have cognitive biases. They use mental shortcuts called heuristics 
        that often lead to poor decisions. Loss aversion makes people fear losses more than they value gains. 
        The availability heuristic makes recent events seem more important. Anchoring bias locks people to 
        first numbers they see. These biases affect investment decisions, career choices, and personal finance.
        """
        
        self.key_concepts = ["behavioral economics", "cognitive biases", "heuristics", "loss aversion"]

    def test_stylization_formal_accuracy(self):
        """Test formal stylization preserves meaning"""
        result = stylize_text(self.source_text, "formal")
        
        similarity = self.metrics.calculate_similarity_score(self.source_text, result)
        keyword_preservation = self.metrics.calculate_keyword_preservation(
            self.source_text, result, self.key_concepts
        )
        
        self.assertGreater(similarity, 0.15)
        self.assertGreater(keyword_preservation, 0.75)

    def test_stylization_casual_accuracy(self):
        """Test casual stylization preserves meaning"""
        result = stylize_text(self.source_text, "casual")
        
        similarity = self.metrics.calculate_similarity_score(self.source_text, result)
        keyword_preservation = self.metrics.calculate_keyword_preservation(
            self.source_text, result, self.key_concepts
        )
        
        self.assertGreater(similarity, 0.15)
        self.assertGreater(keyword_preservation, 0.75)

    def test_stylization_concise_accuracy(self):
        """Test concise stylization preserves meaning"""
        result = stylize_text(self.source_text, "concise")
        
        similarity = self.metrics.calculate_similarity_score(self.source_text, result)
        conciseness = self.metrics.calculate_conciseness(self.source_text, result)
        keyword_preservation = self.metrics.calculate_keyword_preservation(
            self.source_text, result, self.key_concepts
        )
        
        self.assertGreater(similarity, 0.3)
        self.assertGreater(keyword_preservation, 0.75)
        self.assertGreater(conciseness, 0.05)
