"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultAnalyzer = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const openai_1 = require("openai");
class ResultAnalyzer {
    constructor(config) {
        this.config = config;
        const apiKey = config.get('openaiApiKey');
        if (apiKey) {
            this.openai = new openai_1.OpenAI({ apiKey });
        }
    }
    async analyzeResults(workspaceFolder) {
        const testResults = await this.readTestResults(workspaceFolder);
        const coveragePercentage = this.getCoveragePercentage(workspaceFolder);
        const issues = this.findIssues(testResults);
        const slowTests = this.findSlowTests(testResults);
        const recommendations = await this.generateRecommendations(testResults, coveragePercentage);
        return {
            total: testResults.total || 0,
            passed: testResults.passed || 0,
            failed: testResults.failed || 0,
            coverage: coveragePercentage,
            issues,
            slowTests,
            recommendations
        };
    }
    async readTestResults(workspaceFolder) {
        // Look for test result files
        const resultPaths = [
            path.join(workspaceFolder, 'jest-results.json'),
            path.join(workspaceFolder, 'cypress', 'results', 'results.json'),
            path.join(workspaceFolder, 'playwright-report', 'report.json')
        ];
        for (const resultPath of resultPaths) {
            if (fs.existsSync(resultPath)) {
                const resultContent = fs.readFileSync(resultPath, 'utf8');
                return JSON.parse(resultContent);
            }
        }
        // Fallback to simple parsing if no result files exist
        return { total: 0, passed: 0, failed: 0 };
    }
    getCoveragePercentage(workspaceFolder) {
        const coverageJsonPath = path.join(workspaceFolder, 'coverage', 'coverage-final.json');
        if (fs.existsSync(coverageJsonPath)) {
            const coverageData = JSON.parse(fs.readFileSync(coverageJsonPath, 'utf8'));
            let totalStatements = 0;
            let coveredStatements = 0;
            Object.values(coverageData).forEach((fileData) => {
                totalStatements += fileData.statements.total;
                coveredStatements += fileData.statements.covered;
            });
            return totalStatements > 0 ? Math.round((coveredStatements / totalStatements) * 100) : 0;
        }
        return 0;
    }
    findIssues(testResults) {
        const issues = [];
        if (testResults.failed && testResults.failed > 0) {
            issues.push({
                type: 'Test Failures',
                message: `${testResults.failed} tests failed. Check test output for details.`,
                file: ''
            });
        }
        const coverage = this.getCoveragePercentage(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '');
        if (coverage < 80) {
            issues.push({
                type: 'Low Coverage',
                message: `Test coverage is ${coverage}%, which is below the recommended 80%.`,
                file: ''
            });
        }
        return issues;
    }
    findSlowTests(testResults) {
        const slowTests = [];
        // Simplified slow test detection
        if (testResults.testResults) {
            testResults.testResults.forEach((testResult) => {
                if (testResult.duration && testResult.duration > 2000) { // 2 seconds
                    slowTests.push({
                        name: testResult.name,
                        duration: testResult.duration
                    });
                }
            });
        }
        return slowTests;
    }
    async generateRecommendations(testResults, coveragePercentage) {
        if (!this.openai) {
            return this.getDefaultRecommendations(testResults, coveragePercentage);
        }
        try {
            const prompt = `Analyze these test results and provide actionable recommendations:

Test Results: ${JSON.stringify(testResults)}
Coverage: ${coveragePercentage}%

Provide 3-5 specific recommendations to improve test quality and coverage.`;
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are an expert test analyst providing actionable recommendations for improving test quality.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 500
            });
            const recommendations = completion.choices[0].message.content;
            if (recommendations) {
                return recommendations.split('\n').filter(rec => rec.trim() !== '').map(rec => rec.replace(/^-\s/, ''));
            }
        }
        catch (error) {
            console.error('Error generating recommendations:', error);
        }
        return this.getDefaultRecommendations(testResults, coveragePercentage);
    }
    getDefaultRecommendations(testResults, coveragePercentage) {
        const recommendations = [];
        if (testResults.failed && testResults.failed > 0) {
            recommendations.push('Fix all failed tests to ensure code functionality.');
        }
        if (coveragePercentage < 80) {
            recommendations.push(`Increase test coverage to at least 80% by adding tests for uncovered code paths.`);
        }
        if (this.findSlowTests(testResults).length > 0) {
            recommendations.push('Optimize slow tests to improve overall testing speed.');
        }
        recommendations.push('Add more edge case tests to ensure robustness.');
        recommendations.push('Regularly run tests to catch regressions early.');
        return recommendations;
    }
}
exports.ResultAnalyzer = ResultAnalyzer;
//# sourceMappingURL=resultAnalyzer.js.map