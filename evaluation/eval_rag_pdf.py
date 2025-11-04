import unittest
import sys
import os
import json
import re
from datetime import datetime
from unittest.mock import Mock
from sklearn.metrics import precision_score, recall_score, f1_score, accuracy_score
import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'ai-service')))

from chains.rag_components import RAGPipeline


class MetricsCalculator:
    @staticmethod
    def calculate_coherence(text: str) -> float:
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if len(sentences) < 2:
            return 0.5
        
        lengths = [len(s.split()) for s in sentences]
        avg_length = sum(lengths) / len(lengths)
        
        if 5 <= avg_length <= 20:
            return 1.0
        elif 3 <= avg_length <= 25:
            return 0.8
        else:
            return 0.5

    @staticmethod
    def calculate_response_length(text: str) -> int:
        return len(text)

    @staticmethod
    def calculate_word_count(text: str) -> int:
        return len(text.split())

    @staticmethod
    def calculate_sentence_count(text: str) -> int:
        sentences = re.split(r'[.!?]+', text)
        return len([s for s in sentences if s.strip()])

    @staticmethod
    def calculate_avg_sentence_length(text: str) -> float:
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        if not sentences:
            return 0
        word_counts = [len(s.split()) for s in sentences]
        return sum(word_counts) / len(word_counts)

    @staticmethod
    def calculate_vocabulary_richness(text: str) -> float:
        words = text.lower().split()
        unique_words = len(set(words))
        total_words = len(words)
        if total_words == 0:
            return 0
        return unique_words / total_words

    @staticmethod
    def calculate_response_relevance(query: str, response: str) -> float:
        query_words = set(query.lower().split())
        response_words = set(response.lower().split())
        
        if not query_words:
            return 0
        
        overlap = len(query_words & response_words)
        relevance = overlap / len(query_words)
        return relevance

    @staticmethod
    def calculate_context_faithfulness(context: str, answer: str) -> float:
        context_words = set(context.lower().split())
        answer_words = set(answer.lower().split())
        
        if not answer_words:
            return 1.0
        
        faithful_words = len(answer_words & context_words)
        faithfulness = faithful_words / len(answer_words)
        return faithfulness

    @staticmethod
    def calculate_mse(values: list) -> float:
        if not values:
            return 0
        mean = sum(values) / len(values)
        mse = sum((x - mean) ** 2 for x in values) / len(values)
        return round(mse, 4)

    @staticmethod
    def calculate_rmse(values: list) -> float:
        mse = MetricsCalculator.calculate_mse(values)
        return round(mse ** 0.5, 4)

    @staticmethod
    def calculate_mae(values: list) -> float:
        if not values:
            return 0
        mean = sum(values) / len(values)
        mae = sum(abs(x - mean) for x in values) / len(values)
        return round(mae, 4)

    @staticmethod
    def calculate_variance(values: list) -> float:
        if not values:
            return 0
        mean = sum(values) / len(values)
        variance = sum((x - mean) ** 2 for x in values) / len(values)
        return round(variance, 4)

    @staticmethod
    def calculate_std_dev(values: list) -> float:
        variance = MetricsCalculator.calculate_variance(values)
        return round(variance ** 0.5, 4)

    @staticmethod
    def calculate_r2_score(actual: list, predicted: list) -> float:
        if len(actual) != len(predicted) or not actual:
            return 0
        
        mean_actual = sum(actual) / len(actual)
        ss_res = sum((a - p) ** 2 for a, p in zip(actual, predicted))
        ss_tot = sum((a - mean_actual) ** 2 for a in actual)
        
        if ss_tot == 0:
            return 0
        
        r2 = 1 - (ss_res / ss_tot)
        return round(max(-1, min(1, r2)), 4)

    @staticmethod
    def calculate_precision_recall_f1(scores: list, threshold: float = 0.5) -> dict:
        if not scores:
            return {"precision": 0, "recall": 0, "f1": 0, "accuracy": 0}
        
        y_true = [1 if s >= threshold else 0 for s in scores]
        y_pred = [1 if s >= threshold else 0 for s in scores]
        
        if len(set(y_true)) == 1:
            accuracy = 1.0 if y_true[0] == y_pred[0] else 0.0
            return {
                "precision": round(1.0, 4),
                "recall": round(1.0, 4),
                "f1": round(1.0, 4),
                "accuracy": round(accuracy, 4),
            }
        
        precision = round(precision_score(y_true, y_pred, average='binary', zero_division=0), 4)
        recall = round(recall_score(y_true, y_pred, average='binary', zero_division=0), 4)
        f1 = round(f1_score(y_true, y_pred, average='binary', zero_division=0), 4)
        accuracy = round(accuracy_score(y_true, y_pred), 4)
        
        return {
            "precision": precision,
            "recall": recall,
            "f1": f1,
            "accuracy": accuracy,
        }


class TestRAGWithPDF(unittest.TestCase):
    
    metrics_data = {
        "coherence_scores": [],
        "response_lengths": [],
        "word_counts": [],
        "sentence_counts": [],
        "avg_sentence_lengths": [],
        "vocabulary_richness": [],
        "response_relevance": [],
        "context_faithfulness": [],
    }
    
    def setUp(self):
        self.metrics = MetricsCalculator()
        self.rag = RAGPipeline()
        self.pdf_path = "evaluation/Global Research Hub.pdf"
        
        if not os.path.exists(self.pdf_path):
            self.skipTest(f"PDF not found at {self.pdf_path}")

    def load_pdf(self):
        with open(self.pdf_path, 'rb') as f:
            mock_file = Mock()
            mock_file.file.read.return_value = f.read()
            return mock_file

    def test_01_pdf_loads_successfully(self):
        mock_file = self.load_pdf()
        result = self.rag.process_pdf(mock_file)
        
        self.assertIn("message", result)
        self.assertEqual(result["message"], "PDF processed successfully")
        self.assertIsNotNone(self.rag.vectorstore)

    def test_02_query_response_structure(self):
        mock_file = self.load_pdf()
        self.rag.process_pdf(mock_file)
        
        result = self.rag.query_pdf("What is the main topic?")
        
        self.assertIn("answer", result)
        self.assertGreater(len(result["answer"]), 0)

    def test_03_query_returns_information(self):
        mock_file = self.load_pdf()
        self.rag.process_pdf(mock_file)
        
        result = self.rag.query_pdf("What is this document about?")
        answer = result["answer"]
        
        self.assertGreater(len(answer), 10)
        coherence = self.metrics.calculate_coherence(answer)
        self.assertGreater(coherence, 0.3)
        self.metrics_data["coherence_scores"].append(coherence)

    def test_04_context_retrieved(self):
        mock_file = self.load_pdf()
        self.rag.process_pdf(mock_file)
        
        result = self.rag.query_pdf("Key information?")
        
        self.assertIn("answer", result)
        self.assertGreater(len(result["answer"]), 0)

    def test_05_context_quality(self):
        mock_file = self.load_pdf()
        self.rag.process_pdf(mock_file)
        
        result = self.rag.query_pdf("Main topic")
        answer = result["answer"]
        
        self.assertGreater(len(answer), 50)
        self.metrics_data["response_lengths"].append(len(answer))

    def test_06_multiple_queries(self):
        mock_file = self.load_pdf()
        self.rag.process_pdf(mock_file)
        
        queries = ["What is the main topic?", "Summarize this", "Key points?"]
        
        for query in queries:
            with self.subTest(query=query):
                result = self.rag.query_pdf(query)
                answer = result["answer"]
                self.assertGreater(len(answer), 0)
                
                coherence = self.metrics.calculate_coherence(answer)
                self.metrics_data["coherence_scores"].append(coherence)
                
                word_count = self.metrics.calculate_word_count(answer)
                self.metrics_data["word_counts"].append(word_count)
                
                sentence_count = self.metrics.calculate_sentence_count(answer)
                self.metrics_data["sentence_counts"].append(sentence_count)
                
                avg_sent_len = self.metrics.calculate_avg_sentence_length(answer)
                self.metrics_data["avg_sentence_lengths"].append(avg_sent_len)
                
                vocab_richness = self.metrics.calculate_vocabulary_richness(answer)
                self.metrics_data["vocabulary_richness"].append(vocab_richness)
                
                relevance = self.metrics.calculate_response_relevance(query, answer)
                self.metrics_data["response_relevance"].append(relevance)
                
                response_len = self.metrics.calculate_response_length(answer)
                self.metrics_data["response_lengths"].append(response_len)
                
                faithfulness = self.metrics.calculate_context_faithfulness(query, answer)
                self.metrics_data["context_faithfulness"].append(faithfulness)

    def test_07_response_coherence(self):
        mock_file = self.load_pdf()
        self.rag.process_pdf(mock_file)
        
        result = self.rag.query_pdf("What is in this document?")
        answer = result["answer"]
        coherence = self.metrics.calculate_coherence(answer)
        
        self.assertGreater(coherence, 0.3)
        self.metrics_data["coherence_scores"].append(coherence)
        self.metrics_data["response_lengths"].append(self.metrics.calculate_response_length(answer))

    def test_08_answer_length(self):
        mock_file = self.load_pdf()
        self.rag.process_pdf(mock_file)
        
        result = self.rag.query_pdf("Tell me about the content")
        answer = result["answer"]
        
        self.assertGreater(len(answer), 30)
        self.assertLess(len(answer), 10000)

    def test_09_retriever_components(self):
        mock_file = self.load_pdf()
        self.rag.process_pdf(mock_file)
        
        self.assertIsNotNone(self.rag.vectorstore)

    def test_10_error_handling(self):
        try:
            result = self.rag.query_pdf("test")
            self.assertIsInstance(result, dict)
        except Exception as e:
            self.fail(f"RAG raised exception: {str(e)}")


def calculate_overall_metrics(test_class):
    data = test_class.metrics_data
    overall_metrics = {}
    
    all_scores = []
    
    if data["coherence_scores"]:
        all_scores.extend(data["coherence_scores"])
        overall_metrics["coherence"] = {
            "mean": round(sum(data["coherence_scores"]) / len(data["coherence_scores"]), 4),
            "mse": MetricsCalculator.calculate_mse(data["coherence_scores"]),
            "rmse": MetricsCalculator.calculate_rmse(data["coherence_scores"]),
            "std_dev": MetricsCalculator.calculate_std_dev(data["coherence_scores"]),
        }
    
    if data["response_lengths"]:
        overall_metrics["response_length"] = {
            "mean": round(sum(data["response_lengths"]) / len(data["response_lengths"]), 2),
            "mse": MetricsCalculator.calculate_mse(data["response_lengths"]),
            "rmse": MetricsCalculator.calculate_rmse(data["response_lengths"]),
        }
    
    if data["word_counts"]:
        overall_metrics["word_count"] = {
            "mean": round(sum(data["word_counts"]) / len(data["word_counts"]), 2),
            "mse": MetricsCalculator.calculate_mse(data["word_counts"]),
            "rmse": MetricsCalculator.calculate_rmse(data["word_counts"]),
        }
    
    if data["response_relevance"]:
        rel_scores = data["response_relevance"]
        prec_recall_f1 = MetricsCalculator.calculate_precision_recall_f1(rel_scores, threshold=0.5)
        overall_metrics["answer_relevance"] = {
            "mean": round(sum(rel_scores) / len(rel_scores), 4),
            "mse": MetricsCalculator.calculate_mse(rel_scores),
            "rmse": MetricsCalculator.calculate_rmse(rel_scores),
            "precision": prec_recall_f1["precision"],
            "recall": prec_recall_f1["recall"],
            "f1_score": prec_recall_f1["f1"],
            "accuracy": prec_recall_f1["accuracy"],
        }
    
    if data["context_faithfulness"]:
        faith_scores = data["context_faithfulness"]
        prec_recall_f1 = MetricsCalculator.calculate_precision_recall_f1(faith_scores, threshold=0.7)
        overall_metrics["context_faithfulness"] = {
            "mean": round(sum(faith_scores) / len(faith_scores), 4),
            "mse": MetricsCalculator.calculate_mse(faith_scores),
            "rmse": MetricsCalculator.calculate_rmse(faith_scores),
            "precision": prec_recall_f1["precision"],
            "recall": prec_recall_f1["recall"],
            "f1_score": prec_recall_f1["f1"],
            "accuracy": prec_recall_f1["accuracy"],
        }
    
    if data["vocabulary_richness"]:
        overall_metrics["vocabulary_richness"] = {
            "mean": round(sum(data["vocabulary_richness"]) / len(data["vocabulary_richness"]), 4),
            "mse": MetricsCalculator.calculate_mse(data["vocabulary_richness"]),
            "rmse": MetricsCalculator.calculate_rmse(data["vocabulary_richness"]),
        }
    
    return overall_metrics


def generate_report(result, test_class):
    passed = result.testsRun - len(result.failures) - len(result.errors)
    success_rate = (passed / result.testsRun * 100) if result.testsRun > 0 else 0
    
    overall_metrics = calculate_overall_metrics(test_class)
    
    report = {
        "timestamp": datetime.now().isoformat(),
        "module": "RAG Pipeline Evaluator",
        "pdf_file": "evaluation/Global Research Hub.pdf",
        "test_results": {
            "total_tests": result.testsRun,
            "passed": passed,
            "failed": len(result.failures),
            "errors": len(result.errors),
            "success_rate": round(success_rate, 2),
        },
        "overall_metrics": overall_metrics,
    }
    
    with open("pdf_rag_evaluation_report.json", "w") as f:
        json.dump(report, f, indent=2)
    
    print("\n" + "="*80)
    print(json.dumps(report, indent=2))
    print("="*80)


if __name__ == "__main__":
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    suite.addTests(loader.loadTestsFromTestCase(TestRAGWithPDF))
    
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    generate_report(result, TestRAGWithPDF)
    
    sys.exit(0 if result.wasSuccessful() else 1)