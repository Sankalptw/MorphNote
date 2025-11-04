import unittest
import sys
import json
from datetime import datetime


def run_accuracy_evaluation():
    """Run all accuracy evaluation tests"""
    
    from test_keypoints_accuracy import TestKeypointsAccuracy
    from test_summarization_accuracy import TestSummarizationAccuracy
    from test_stylization_accuracy import TestStylizationAccuracy

    loader = unittest.TestLoader()
    suite = unittest.TestSuite()

    suite.addTests(loader.loadTestsFromTestCase(TestKeypointsAccuracy))
    suite.addTests(loader.loadTestsFromTestCase(TestSummarizationAccuracy))
    suite.addTests(loader.loadTestsFromTestCase(TestStylizationAccuracy))

    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    generate_accuracy_report(result)

    return result


def generate_accuracy_report(result):
    """Generate accuracy evaluation report"""
    
    passed = result.testsRun - len(result.failures) - len(result.errors)
    success_rate = (passed / result.testsRun * 100) if result.testsRun > 0 else 0
    
    report = {
        "timestamp": datetime.now().isoformat(),
        "total_tests": result.testsRun,
        "passed": passed,
        "failed": len(result.failures),
        "errors": len(result.errors),
        "success_rate": round(success_rate, 2),
    }
    
    report_path = "accuracy_evaluation_report.json"
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)


if __name__ == "__main__":
    result = run_accuracy_evaluation()
    sys.exit(0 if result.wasSuccessful() else 1)