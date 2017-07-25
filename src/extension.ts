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

    updateOffset();
    statusBarEntry.show();

    vscode.window.onDidChangeTextEditorSelection(updateOffset, null, context.subscriptions);

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