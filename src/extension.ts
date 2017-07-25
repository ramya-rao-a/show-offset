'use strict';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let offsetType = 'character';
    let statusBarEntry: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);

    const updateOffset = () => {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            statusBarEntry.text = '';
            statusBarEntry.hide();
            return;
        }
        if (!statusBarEntry.text) {
            statusBarEntry.show();
        }

        let offset = editor.document.offsetAt(editor.selection.active);
        if (offsetType === 'byte') {
            offset = Buffer.byteLength(editor.document.getText().substr(0, offset));
        }
        statusBarEntry.text = `Offset: ${offset}`;
    }

    const goToOffset = (args) => {
        let editor = vscode.window.activeTextEditor;
        if (!editor || (args && typeof args !== 'number')) {
            return;
        }
        let maxOffset = editor.document.getText().length;
        let offsetPromise = args ? Promise.resolve(args) : vscode.window.showInputBox({ prompt: `Type offset between 0 and ${maxOffset}` });
        offsetPromise.then((offset) => {
            let offsetNumber = /^[\d]+$/.test(offset) ? Number(offset) : -1;
            if (offsetNumber < 0 || offsetNumber > maxOffset) {
                return;
            }
            const newPosition = editor.document.positionAt(offsetNumber);
            editor.selection = new vscode.Selection(newPosition, newPosition);
        });
    }

    updateOffset();
    statusBarEntry.show();

    vscode.window.onDidChangeTextEditorSelection(updateOffset, null, context.subscriptions);
    context.subscriptions.push(vscode.commands.registerCommand('showoffset.goToOffset', goToOffset));

    vscode.workspace.onDidChangeConfiguration(() => {
        let updatedConfig = vscode.workspace.getConfiguration('showoffset');
        if (offsetType !== updatedConfig['offsetType']
            && (updatedConfig['offsetType'] === 'character'
                || updatedConfig['offsetType'] === 'byte')) {
            offsetType = updatedConfig['offsetType'];
            updateOffset();
        }
    });
}


// this method is called when your extension is deactivated
export function deactivate() {
}