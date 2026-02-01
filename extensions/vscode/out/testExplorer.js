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
exports.TestItem = exports.TestExplorerProvider = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class TestExplorerProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    async getChildren(element) {
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showInformationMessage('No workspace open!');
            return [];
        }
        if (element) {
            return this.getTestItems(element);
        }
        else {
            return this.getWorkspaceTestItems(vscode.workspace.workspaceFolders[0].uri.fsPath);
        }
    }
    async getWorkspaceTestItems(workspacePath) {
        const testFiles = await this.findTestFiles(workspacePath);
        const dirs = new Set();
        testFiles.forEach(file => {
            const dir = path.dirname(file);
            if (dir !== workspacePath) {
                dirs.add(dir);
            }
        });
        // Add directories first
        const dirItems = Array.from(dirs).sort().map(dir => {
            const relativePath = path.relative(workspacePath, dir);
            return new TestItem(relativePath, vscode.TreeItemCollapsibleState.Collapsed, 'directory', dir);
        });
        // Add root test files
        const rootTestFiles = testFiles.filter(file => path.dirname(file) === workspacePath);
        const rootItems = await Promise.all(rootTestFiles.map(file => this.getTestFileItem(file, workspacePath)));
        return [...dirItems, ...rootItems];
    }
    async getTestItems(parent) {
        if (parent.type === 'directory') {
            const testFiles = await this.findTestFiles(parent.path);
            return Promise.all(testFiles.map(file => this.getTestFileItem(file, parent.path)));
        }
        if (parent.type === 'file') {
            return this.getTestCasesFromFile(parent.path);
        }
        return [];
    }
    async findTestFiles(dir) {
        const files = [];
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                files.push(...await this.findTestFiles(fullPath));
            }
            else if (entry.isFile() && this.isTestFile(entry.name)) {
                files.push(fullPath);
            }
        }
        return files;
    }
    isTestFile(fileName) {
        return fileName.includes('.test.') || fileName.includes('.spec.') || fileName.endsWith('.test.js') || fileName.endsWith('.test.ts') || fileName.endsWith('.spec.js') || fileName.endsWith('.spec.ts');
    }
    async getTestFileItem(filePath, parentPath) {
        const relativePath = path.relative(parentPath, filePath);
        const testCases = await this.getTestCasesFromFile(filePath);
        return new TestItem(relativePath, testCases.length > 0 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None, 'file', filePath);
    }
    async getTestCasesFromFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        const testCases = [];
        // Simple regex to find test cases (works for jest, mocha, etc.)
        const testRegex = /(test|it)\(["']([^"']+)["']/g;
        let match;
        while ((match = testRegex.exec(content)) !== null) {
            testCases.push(new TestItem(match[2], vscode.TreeItemCollapsibleState.None, 'test', filePath, {
                command: 'frontend-test-agent.runTests',
                title: 'Run Test',
                arguments: [vscode.Uri.file(filePath)]
            }));
        }
        return testCases;
    }
}
exports.TestExplorerProvider = TestExplorerProvider;
class TestItem extends vscode.TreeItem {
    constructor(label, collapsibleState, type, path, command) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.type = type;
        this.path = path;
        this.command = command;
        switch (type) {
            case 'directory':
                this.iconPath = new vscode.ThemeIcon('folder');
                break;
            case 'file':
                this.iconPath = new vscode.ThemeIcon('file-code');
                this.contextValue = 'testFile';
                break;
            case 'test':
                this.iconPath = new vscode.ThemeIcon('beaker');
                this.contextValue = 'testCase';
                break;
        }
    }
}
exports.TestItem = TestItem;
//# sourceMappingURL=testExplorer.js.map