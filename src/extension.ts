import * as vscode from 'vscode';
import axios from 'axios';

let timeout: NodeJS.Timeout | undefined = undefined;
let isEnabled = true;

export function activate(context: vscode.ExtensionContext) {
	// Create a new status bar item
	let statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);

	// Set the text and icon of the status bar item
	statusBarItem.text = `$(beaker) CodacusCoder`;
	statusBarItem.tooltip = "Click to enable/disable CodacusCoder";

	// Add a command to the status bar item
	statusBarItem.command = 'codacusCoder.toggleEnable';
	context.subscriptions.push(vscode.commands.registerCommand('codacusCoder.toggleEnable', () => {
		isEnabled = !isEnabled;
		statusBarItem.text = isEnabled ? `$(beaker) CodacusCoder` : `$(beaker) CodacusCoder (Disabled)`;
	}));
	// Show the status bar item
	statusBarItem.show();

	context.subscriptions.push(statusBarItem);

	context.subscriptions.push(
		vscode.languages.registerInlineCompletionItemProvider(
			{ pattern: "**" },
			{
				provideInlineCompletionItems: async (document: vscode.TextDocument, position: vscode.Position) => {
					if (!isEnabled) {
						return [];
					}
					if (timeout) {
						clearTimeout(timeout);
					}
					return await new Promise<vscode.InlineCompletionItem[]>(resolve => {
						let config = vscode.workspace.getConfiguration('codacusCoder');
						let debounceTime: number = config.get('debounceTime') as number;
						timeout = setTimeout(async () => {
							// Show spinner in status bar
							statusBarItem.text = `$(sync~spin) CodacusCoder`;


							try {
								// Get the configuration for the extension

								let text = document.getText();
								// Make a POST request to the /api/generate endpoint
								console.log("code to complete ", JSON.stringify(text));

								let apiEndpoint = config.get('apiEndpoint');
								let model = config.get('model');

								const response = await axios.post(`${apiEndpoint}`, {

									model: model,
									prompt: `${text}`,
									system: `
									you are an automated code completion model, 
									and your job is to complete the code that is provided with best of your ability
									* only provide the code completion, i.e rest of the code that can be appended after the code provided
									* dont rewrite from start, just predict the next tokens

									respond using the below json format :
									{
										completion: "your code completion"
									}
									`,
									stream: false,
									format: "json",
								});

								console.log(response.data.response);

								// Use the response directly
								let modelResponse = JSON.parse(response.data.response);
								let generatedText = modelResponse.completion;

								// Remove backticks at the beginning and end of the string, and any language name after the opening backticks
								generatedText = generatedText.replace(/^```[^\s]*|```$|^`|`$/g, '');
								console.log("after cleaning", generatedText);

								const completionItem = new vscode.InlineCompletionItem(`${generatedText}`);
								completionItem.range = document.getWordRangeAtPosition(position) || new vscode.Range(position, position);
								resolve([completionItem]);
							} catch (error: any) {
								console.error(`Failed to generate completion: ${error.message}`);
								resolve([]);
							} finally {
								// Hide spinner in status bar
								statusBarItem.text = isEnabled ? `$(beaker) CodacusCoder` : `$(beaker) CodacusCoder (Disabled)`;
							}
						}, debounceTime || 1000); // 1000ms debounce
					});
				}
			}
		)
	);
}

export function deactivate() {
	if (timeout) {
		clearTimeout(timeout);
	}
}