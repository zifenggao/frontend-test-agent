import { readFileSync, existsSync } from 'fs';
import { logger } from '../utils/logger';


export interface Issue {
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  impact: string;
  recommendation: string;
}

export interface Suggestion {
  description: string;
  benefit: string;
  effort: 'low' | 'medium' | 'high';
}

export interface AnalysisResult {
  issues: Issue[];
  criticalIssues: number;
  suggestions: Suggestion[];
  performanceMetrics: {
    averageTestTime: number;
    slowestTest: number;
    testThroughput: number;
  };
}

export class ResultAnalyzer {
  /**
   * Analyze test results and provide insights
   */
  async analyze(resultPath: string): Promise<AnalysisResult> {
    logger.debug(`Analyzing test results at ${resultPath}...`);

    // Read results file
    let results;
    try {
      if (existsSync(resultPath)) {
        const content = readFileSync(resultPath, 'utf-8');
        results = JSON.parse(content);
      } else {
        // Try to find test results in common locations
        const commonPaths = [
          'test-results.json',
          'coverage/coverage-summary.json',
          'jest-results.json',
          'cypress/results.json'
        ];
        
        for (const path of commonPaths) {
          if (existsSync(path)) {
            const content = readFileSync(path, 'utf-8');
            results = JSON.parse(content);
            break;
          }
        }
      }

      if (!results) {
        throw new Error('No test results found');
      }
    } catch (error) {
      logger.error(`Failed to read test results: ${(error as Error).message}`);
      return this.createDefaultAnalysisResult();
    }

    // Analyze results
    const issues = this.detectIssues(results);
    const suggestions = this.generateSuggestions(results, issues);
    const performanceMetrics = this.calculatePerformanceMetrics(results);

    return {
      issues,
      criticalIssues: issues.filter(issue => issue.severity === 'critical').length,
      suggestions,
      performanceMetrics
    };
  }

  /**
   * Detect issues from test results
   */
  private detectIssues(results: any): Issue[] {
    const issues: Issue[] = [];

    // Check for test failures
    if (results.numFailedTests && results.numFailedTests > 0) {
      issues.push({
        description: `${results.numFailedTests} tests are failing`,
        severity: results.numFailedTests / results.numTotalTests > 0.3 ? 'critical' : 'high',
        impact: `Failed tests indicate broken functionality. ${results.numFailedTests} out of ${results.numTotalTests} tests are failing.`,
        recommendation: 'Investigate and fix failed tests immediately. Focus on tests with highest impact first.'
      });
    }

    // Check for low test coverage
    if (results.coverage) {
      const coverage = results.coverage;
      const lowCoverageAreas = [];
      if (coverage.statements < 70) lowCoverageAreas.push('statements');
      if (coverage.branches < 60) lowCoverageAreas.push('branches');
      if (coverage.functions < 70) lowCoverageAreas.push('functions');
      if (coverage.lines < 70) lowCoverageAreas.push('lines');

      if (lowCoverageAreas.length > 0) {
        issues.push({
          description: `Low test coverage in ${lowCoverageAreas.join(', ')}`,
          severity: lowCoverageAreas.length > 2 ? 'high' : 'medium',
          impact: `Low coverage means parts of the codebase are untested, increasing the risk of undetected bugs.`,
          recommendation: `Add more test cases to cover ${lowCoverageAreas.join(', ')}. Aim for at least 80% coverage across all areas.`
        });
      }
    }

    // Check for slow tests
    if (results.testResults) {
      const slowTests = results.testResults.filter((test: any) => test.endTime - test.startTime > 5000);
      if (slowTests.length > 0) {
        issues.push({
          description: `${slowTests.length} tests are running slowly (>5s)`,
          severity: slowTests.length > 5 ? 'medium' : 'low',
          impact: `Slow tests increase development cycle time and may indicate performance issues in the codebase.`,
          recommendation: `Optimize slow tests by reducing setup time, mocking external dependencies, or splitting large tests.`
        });
      }
    }

    // Check for flaky tests (if available)
    if (results.flakyTests && results.flakyTests.length > 0) {
      issues.push({
        description: `${results.flakyTests.length} flaky tests detected`,
        severity: 'high',
        impact: `Flaky tests undermine trust in the test suite and make it difficult to detect real failures.`,
        recommendation: 'Investigate flaky tests by adding more context, reducing test interdependence, or fixing non-deterministic behavior.'
      });
    }

    return issues;
  }

  /**
   * Generate improvement suggestions based on results
   */
  private generateSuggestions(results: any, issues: Issue[]): Suggestion[] {
    const suggestions: Suggestion[] = [];

    // Suggest test parallelization if there are many tests
    if (results.numTotalTests && results.numTotalTests > 100) {
      suggestions.push({
        description: 'Enable test parallelization',
        benefit: 'Significantly reduce test execution time, especially in CI environments',
        effort: 'medium'
      });
    }

    // Suggest snapshot testing for UI components
    if (results.testResults?.some((test: any) => test.testPath.includes('components'))) {
      suggestions.push({
        description: 'Add snapshot testing for UI components',
        benefit: 'Quickly detect unintended UI changes and prevent regressions',
        effort: 'low'
      });
    }

    // Suggest performance testing
    const hasPerformanceIssues = issues.some(issue => issue.description.includes('slow'));
    if (hasPerformanceIssues) {
      suggestions.push({
        description: 'Add performance testing to CI pipeline',
        benefit: 'Catch performance regressions early and maintain application responsiveness',
        effort: 'high'
      });
    }

    // Suggest mutation testing for critical code
    if (results.numTotalTests && results.numTotalTests > 50 && !issues.some(issue => issue.description.includes('coverage'))) {
      suggestions.push({
        description: 'Introduce mutation testing for critical modules',
        benefit: 'Improve test suite quality by ensuring tests can detect real bugs',
        effort: 'high'
      });
    }

    // Suggest automated test maintenance
    if (results.numFailedTests && results.numFailedTests > 0) {
      suggestions.push({
        description: 'Implement automated test maintenance processes',
        benefit: 'Reduce the time spent maintaining tests and keep the test suite reliable',
        effort: 'medium'
      });
    }

    return suggestions;
  }

  /**
   * Calculate performance metrics
   */
  private calculatePerformanceMetrics(results: any): any {
    if (!results.testResults) {
      return {
        averageTestTime: 0,
        slowestTest: 0,
        testThroughput: 0
      };
    }

    const testTimes = results.testResults
      .map((test: any) => test.endTime - test.startTime)
      .filter((time: number) => time > 0);

    if (testTimes.length === 0) {
      return {
        averageTestTime: 0,
        slowestTest: 0,
        testThroughput: 0
      };
    }

    const averageTestTime = testTimes.reduce((a: number, b: number) => a + b, 0) / testTimes.length;
    const slowestTest = Math.max(...testTimes);
    const totalTime = results.endTime - results.startTime;
    const testThroughput = totalTime > 0 ? results.numTotalTests / (totalTime / 1000) : 0;

    return {
      averageTestTime: Math.round(averageTestTime),
      slowestTest: Math.round(slowestTest),
      testThroughput: Math.round(testThroughput * 100) / 100
    };
  }

  /**
   * Create default analysis result when no results are found
   */
  private createDefaultAnalysisResult(): AnalysisResult {
    return {
      issues: [],
      criticalIssues: 0,
      suggestions: [
        {
          description: 'Set up automated testing pipeline',
          benefit: 'Catch bugs early and improve code quality',
          effort: 'high'
        },
        {
          description: 'Add unit tests for core functionality',
          benefit: 'Prevent regressions and make refactoring easier',
          effort: 'medium'
        }
      ],
      performanceMetrics: {
        averageTestTime: 0,
        slowestTest: 0,
        testThroughput: 0
      }
    };
  }
}