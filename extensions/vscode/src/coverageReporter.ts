import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class CoverageReporter {
    private config: vscode.WorkspaceConfiguration;

    constructor(config: vscode.WorkspaceConfiguration) {
        this.config = config;
    }

    async generateCoverage(result: any): Promise<void> {
        const enableCoverage = this.config.get<boolean>('enableCoverage', true);
        if (!enableCoverage) {
            return;
        }

        const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceFolder) {
            return;
        }

        // Look for coverage report files
        const coverageFiles = [
            path.join(workspaceFolder, 'coverage', 'lcov-report', 'index.html'),
            path.join(workspaceFolder, 'coverage', 'index.html'),
            path.join(workspaceFolder, '.nyc_output', 'out.json')
        ];

        const existingCoverageFile = coverageFiles.find(file => fs.existsSync(file));
        if (existingCoverageFile) {
            vscode.window.showInformationMessage('Coverage report generated successfully! 📊');
        }
    }

    async showCoverage(): Promise<void> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceFolder) {
            throw new Error('No workspace folder open');
        }

        const coverageHtmlPath = path.join(workspaceFolder, 'coverage', 'lcov-report', 'index.html');
        if (fs.existsSync(coverageHtmlPath)) {
            await vscode.commands.executeCommand('vscode.open', vscode.Uri.file(coverageHtmlPath));
        } else {
            throw new Error('Coverage report not found. Please run tests first with coverage enabled.');
        }
    }

    getCoveragePercentage(): number {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceFolder) {
            return 0;
        }

        const coverageJsonPath = path.join(workspaceFolder, 'coverage', 'coverage-final.json');
        if (fs.existsSync(coverageJsonPath)) {
            const coverageData = JSON.parse(fs.readFileSync(coverageJsonPath, 'utf8'));
            let totalStatements = 0;
            let coveredStatements = 0;

            Object.values(coverageData).forEach((fileData: any) => {
                totalStatements += fileData.statements.total;
                coveredStatements += fileData.statements.covered;
            });

            return totalStatements > 0 ? Math.round((coveredStatements / totalStatements) * 100) : 0;
        }

        return 0;
    }
}
