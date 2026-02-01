import * as vscode from 'vscode';
import * as child_process from 'child_process';
import * as path from 'path';

export class TestRunner {
    private config: vscode.WorkspaceConfiguration;

    constructor(config: vscode.WorkspaceConfiguration) {
        this.config = config;
    }

    async runTests(
        testPaths: string[],
        runner: string,
        progress: vscode.Progress<{ increment?: number; message?: string }>
    ): Promise<any> {
        progress.report({ increment: 25, message: `Running tests with ${runner}...` });

        let command: string[];
        let cwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || process.cwd();

        switch (runner) {
            case 'jest':
                command = ['npx', 'jest', ...testPaths, '--coverage'];
                break;
            case 'cypress':
                command = ['npx', 'cypress', 'run', '--spec', testPaths.join(',')];
                break;
            case 'playwright':
                command = ['npx', 'playwright', 'test', ...testPaths];
                break;
            default:
                throw new Error(`Unsupported test runner: ${runner}`);
        }

        return new Promise((resolve, reject) => {
            const child = child_process.spawn(command[0], command.slice(1), { cwd, stdio: 'pipe' });
            let output = '';
            let errorOutput = '';

            child.stdout.on('data', (data) => {
                output += data.toString();
                progress.report({ message: data.toString().trimEnd().split('\n').pop() });
            });

            child.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            child.on('close', (code) => {
                progress.report({ increment: 100, message: 'Tests completed!' });

                if (code === 0) {
                    resolve(this.parseResults(output, runner));
                } else {
                    reject(new Error(`Tests failed: ${errorOutput || output}`));
                }
            });

            child.on('error', (error) => {
                reject(new Error(`Failed to run tests: ${error.message}`));
            });
        });
    }

    private parseResults(output: string, runner: string): any {
        // Simplified result parsing - would need to be expanded for real use
        const lines = output.split('\n');
        let passed = 0;
        let failed = 0;
        let skipped = 0;
        let total = 0;

        switch (runner) {
            case 'jest':
                // Jest output parsing
                const jestSummaryLine = lines.find(line => line.includes('Tests:') || line.includes('Total Tests:'));
                if (jestSummaryLine) {
                    const passMatch = jestSummaryLine.match(/(\d+) passed/);
                    const failMatch = jestSummaryLine.match(/(\d+) failed/);
                    const skipMatch = jestSummaryLine.match(/(\d+) skipped/);
                    const totalMatch = jestSummaryLine.match(/(\d+) total/);

                    passed = passMatch ? parseInt(passMatch[1]) : 0;
                    failed = failMatch ? parseInt(failMatch[1]) : 0;
                    skipped = skipMatch ? parseInt(skipMatch[1]) : 0;
                    total = totalMatch ? parseInt(totalMatch[1]) : 0;
                }
                break;
            case 'cypress':
                // Cypress output parsing
                const cypressSummaryLine = lines.find(line => line.includes('All specs passed!') || line.includes('specs passed'));
                if (cypressSummaryLine) {
                    const passMatch = cypressSummaryLine.match(/(\d+) passed/);
                    const failMatch = cypressSummaryLine.match(/(\d+) failed/);
                    const totalMatch = cypressSummaryLine.match(/(\d+) spec/);

                    passed = passMatch ? parseInt(passMatch[1]) : 0;
                    failed = failMatch ? parseInt(failMatch[1]) : 0;
                    total = totalMatch ? parseInt(totalMatch[1]) : 0;
                }
                break;
            case 'playwright':
                // Playwright output parsing
                const playwrightSummaryLine = lines.find(line => line.includes('passed') && line.includes('failed'));
                if (playwrightSummaryLine) {
                    const passMatch = playwrightSummaryLine.match(/(\d+) passed/);
                    const failMatch = playwrightSummaryLine.match(/(\d+) failed/);
                    const skipMatch = playwrightSummaryLine.match(/(\d+) skipped/);
                    const totalMatch = playwrightSummaryLine.match(/(\d+) total/);

                    passed = passMatch ? parseInt(passMatch[1]) : 0;
                    failed = failMatch ? parseInt(failMatch[1]) : 0;
                    skipped = skipMatch ? parseInt(skipMatch[1]) : 0;
                    total = totalMatch ? parseInt(totalMatch[1]) : 0;
                }
                break;
        }

        return {
            passed,
            failed,
            skipped,
            total,
            duration: Date.now() - (Date.now() - 10000), // Simplified duration
            output
        };
    }
}
