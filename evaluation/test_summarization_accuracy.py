import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'ai-service')))

from chains.summarization_chain import summarize_text_notes
from accuracy_metrics import AccuracyMetrics


class TestSummarizationAccuracy(unittest.TestCase):
    """Test accuracy of text summarization"""

    def setUp(self):
        self.metrics = AccuracyMetrics()
        
        self.sample_ml = """
        Machine Learning is a subset of Artificial Intelligence that enables systems to learn and improve 
        from experience without being explicitly programmed. There are three main types: supervised learning, 
        unsupervised learning, and reinforcement learning.
        
        Supervised Learning uses labeled training data. The model learns the mapping between inputs and outputs.
        Common algorithms include Linear Regression, Logistic Regression, Support Vector Machines (SVM), 
        and Decision Trees.
        
        Unsupervised Learning finds patterns in unlabeled data. K-means clustering groups similar data points.
        Principal Component Analysis (PCA) reduces dimensionality while preserving variance.
        
        Reinforcement Learning trains agents to make sequential decisions. The agent receives rewards or penalties
        based on actions. Q-learning and Policy Gradient methods are popular RL algorithms.
        
        Neural Networks consist of interconnected nodes organized in layers. Deep Learning uses multiple hidden layers.
        Convolutional Neural Networks (CNNs) excel at image processing. Recurrent Neural Networks (RNNs) handle sequences.
        """
        
        self.keywords_ml = ["Machine Learning", "Supervised", "Unsupervised", "Reinforcement", "algorithms", "Neural Networks"]

        self.sample_covid = """
        The COVID-19 pandemic, caused by the novel coronavirus SARS-CoV-2, emerged in late 2019 and 
        became a global health crisis. The virus spreads through respiratory droplets and causes respiratory 
        illness ranging from asymptomatic to severe pneumonia and death. Risk factors include age over 65, 
        diabetes, cardiovascular disease, and obesity.
        
        Transmission rates varied by location and intervention strategies. Initial outbreaks in China spread 
        to Europe and North America by March 2020. Social distancing, mask wearing, and quarantine of exposed 
        individuals reduced transmission. Vaccines developed at unprecedented speed provided immunity through 
        mRNA technology and viral vector approaches.
        
        Global impacts included over 6 million deaths, healthcare system overwhelm, economic disruption, 
        mental health consequences, and educational interruption. Remote work and learning became widespread. 
        Supply chains faced disruptions affecting manufacturing and trade globally.
        """
        
        self.keywords_covid = ["COVID-19", "SARS-CoV-2", "coronavirus", "vaccine", "pandemic", "transmission"]

    def test_summarization_accuracy_ml(self):
        """Test summarization accuracy on ML text"""
        result = summarize_text_notes(self.sample_ml)
        
        coverage = self.metrics.calculate_coverage(self.sample_ml, result)
        conciseness = self.metrics.calculate_conciseness(self.sample_ml, result)
        keyword_preservation = self.metrics.calculate_keyword_preservation(
            self.sample_ml, result, self.keywords_ml
        )
        
        self.assertGreater(conciseness, 0.2)
        self.assertGreater(keyword_preservation, 0.3)
        self.assertGreater(coverage, 0.25)

    def test_summarization_accuracy_covid(self):
        """Test summarization accuracy on COVID text"""
        result = summarize_text_notes(self.sample_covid)
        
        coverage = self.metrics.calculate_coverage(self.sample_covid, result)
        conciseness = self.metrics.calculate_conciseness(self.sample_covid, result)
        keyword_preservation = self.metrics.calculate_keyword_preservation(
            self.sample_covid, result, self.keywords_covid
        )
        
        self.assertGreater(conciseness, 0.2)
        self.assertGreater(keyword_preservation, 0.3)

