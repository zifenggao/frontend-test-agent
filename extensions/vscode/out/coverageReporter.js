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
exports.CoverageReporter = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class CoverageReporter {
    constructor(config) {
        this.config = config;
    }
    async generateCoverage(result) {
        const enableCoverage = this.config.get('enableCoverage', true);
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
    async showCoverage() {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceFolder) {
            throw new Error('No workspace folder open');
        }
        const coverageHtmlPath = path.join(workspaceFolder, 'coverage', 'lcov-report', 'index.html');
        if (fs.existsSync(coverageHtmlPath)) {
            await vscode.commands.executeCommand('vscode.open', vscode.Uri.file(coverageHtmlPath));
        }
        else {
            throw new Error('Coverage report not found. Please run tests first with coverage enabled.');
        }
    }
    getCoveragePercentage() {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceFolder) {
            return 0;
        }
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
}
exports.CoverageReporter = CoverageReporter;
//# sourceMappingURL=coverageReporter.js.map