import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'ai-service')))

from chains.keypoints_chain import extract_keypoints
from accuracy_metrics import AccuracyMetrics


class TestKeypointsAccuracy(unittest.TestCase):
    """Test accuracy of keypoints extraction"""

    def setUp(self):
        self.metrics = AccuracyMetrics()
        
        self.biology_text = """
        Photosynthesis is the process where plants convert sunlight into chemical energy stored in glucose.
        This occurs in two main stages: light-dependent reactions in the thylakoid membrane and light-independent 
        reactions (Calvin cycle) in the stroma. The light-dependent reactions use chlorophyll to absorb photons,
        exciting electrons to produce ATP and NADPH. Water molecules are split, releasing oxygen as a byproduct.
        The Calvin cycle uses ATP and NADPH to reduce CO2 into glucose through a series of enzyme-catalyzed steps.
        """
        self.biology_keywords = ["Photosynthesis", "chlorophyll", "Calvin cycle", "ATP", "NADPH", "glucose"]

        self.history_text = """
        The French Revolution (1789-1799) fundamentally transformed European society and politics. 
        It began due to financial crisis, food shortage, and Enlightenment ideas about liberty and equality.
        Key events include the storming of the Bastille in 1789, the Declaration of Rights of Man in August 1789,
        and the execution of King Louis XVI in 1793. The revolution abolished feudalism, established constitutional monarchy,
        and introduced the metric system. It inspired democratic movements worldwide and marked the end of absolute monarchy.
        """
        self.history_keywords = ["French Revolution", "1789", "Bastille", "Louis XVI", "feudalism", "democracy"]

        self.tech_text = """
        REST APIs use HTTP methods for CRUD operations. GET retrieves resources identified by URIs.
        POST creates new resources with data in request body. PUT replaces entire resources while PATCH 
        partially updates them. DELETE removes resources. Status codes indicate outcomes: 2xx for success,
        3xx for redirection, 4xx for client errors (401 Unauthorized, 404 Not Found), 5xx for server errors.
        Authentication uses Basic Auth, Bearer tokens with JWT, or OAuth for delegated access.
        """
        self.tech_keywords = ["REST", "HTTP", "GET", "POST", "PUT", "DELETE", "JWT", "OAuth"]

    def test_keypoints_accuracy_biology(self):
        """Test keypoints accuracy on biology text"""
        result = extract_keypoints(self.biology_text)
        
        coverage = self.metrics.calculate_coverage(self.biology_text, result)
        coherence = self.metrics.calculate_coherence(result)
        keyword_preservation = self.metrics.calculate_keyword_preservation(
            self.biology_text, result, self.biology_keywords
        )
        
        self.assertGreater(coverage, 0.2)
        self.assertGreater(keyword_preservation, 0.3)
        self.assertGreater(coherence, 0.4)

    def test_keypoints_accuracy_history(self):
        """Test keypoints accuracy on history text"""
        result = extract_keypoints(self.history_text)
        
        coverage = self.metrics.calculate_coverage(self.history_text, result)
        keyword_preservation = self.metrics.calculate_keyword_preservation(
            self.history_text, result, self.history_keywords
        )
        
        self.assertGreater(coverage, 0.2)
        self.assertGreater(keyword_preservation, 0.3)

    def test_keypoints_accuracy_technical(self):
        """Test keypoints accuracy on technical text"""
        result = extract_keypoints(self.tech_text)
        
        coverage = self.metrics.calculate_coverage(self.tech_text, result)
        keyword_preservation = self.metrics.calculate_keyword_preservation(
            self.tech_text, result, self.tech_keywords
        )
        
        self.assertGreater(coverage, 0.2)
        self.assertGreater(keyword_preservation, 0.3)

