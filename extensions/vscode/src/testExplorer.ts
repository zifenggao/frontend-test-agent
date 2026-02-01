import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class TestExplorerProvider implements vscode.TreeDataProvider<TestItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TestItem | undefined | void> = new vscode.EventEmitter<TestItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<TestItem | undefined | void> = this._onDidChangeTreeData.event;

    constructor() {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: TestItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: TestItem): Promise<TestItem[]> {
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showInformationMessage('No workspace open!');
            return [];
        }

        if (element) {
            return this.getTestItems(element);
        } else {
            return this.getWorkspaceTestItems(vscode.workspace.workspaceFolders[0].uri.fsPath);
        }
    }

    private async getWorkspaceTestItems(workspacePath: string): Promise<TestItem[]> {
        const testFiles = await this.findTestFiles(workspacePath);
        const dirs = new Set<string>();

        testFiles.forEach(file => {
            const dir = path.dirname(file);
            if (dir !== workspacePath) {
                dirs.add(dir);
            }
        });

        // Add directories first
        const dirItems = Array.from(dirs).sort().map(dir => {
            const relativePath = path.relative(workspacePath, dir);
            return new TestItem(
                relativePath,
                vscode.TreeItemCollapsibleState.Collapsed,
                'directory',
                dir
            );
        });

        // Add root test files
        const rootTestFiles = testFiles.filter(file => path.dirname(file) === workspacePath);
        const rootItems = await Promise.all(rootTestFiles.map(file => this.getTestFileItem(file, workspacePath)));

        return [...dirItems, ...rootItems];
    }

    private async getTestItems(parent: TestItem): Promise<TestItem[]> {
        if (parent.type === 'directory') {
            const testFiles = await this.findTestFiles(parent.path);
            return Promise.all(testFiles.map(file => this.getTestFileItem(file, parent.path)));
        }

        if (parent.type === 'file') {
            return this.getTestCasesFromFile(parent.path);
        }

        return [];
    }

    private async findTestFiles(dir: string): Promise<string[]> {
        const files: string[] = [];

        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                files.push(...await this.findTestFiles(fullPath));
            } else if (entry.isFile() && this.isTestFile(entry.name)) {
                files.push(fullPath);
            }
        }

        return files;
    }

    private isTestFile(fileName: string): boolean {
        return fileName.includes('.test.') || fileName.includes('.spec.') || fileName.endsWith('.test.js') || fileName.endsWith('.test.ts') || fileName.endsWith('.spec.js') || fileName.endsWith('.spec.ts');
    }

    private async getTestFileItem(filePath: string, parentPath: string): Promise<TestItem> {
        const relativePath = path.relative(parentPath, filePath);
        const testCases = await this.getTestCasesFromFile(filePath);

        return new TestItem(
            relativePath,
            testCases.length > 0 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
            'file',
            filePath
        );
    }

    private async getTestCasesFromFile(filePath: string): Promise<TestItem[]> {
        const content = fs.readFileSync(filePath, 'utf8');
        const testCases: TestItem[] = [];

        // Simple regex to find test cases (works for jest, mocha, etc.)
        const testRegex = /(test|it)\(["']([^"']+)["']/g;
        let match;

        while ((match = testRegex.exec(content)) !== null) {
            testCases.push(new TestItem(
                match[2],
                vscode.TreeItemCollapsibleState.None,
                'test',
                filePath,
                {
                    command: 'frontend-test-agent.runTests',
                    title: 'Run Test',
                    arguments: [vscode.Uri.file(filePath)]
                }
            ));
        }

        return testCases;
    }
}

export class TestItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly type: 'directory' | 'file' | 'test',
        public readonly path: string,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);

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
