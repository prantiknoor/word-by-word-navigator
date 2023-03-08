import { ExtensionContext, commands } from "vscode";
import Navigator from "./Navigator";
import { getCommands } from "./commands";

export function activate(context: ExtensionContext) {
	console.log('Word-by-word Navigator extension has activated.');

	const allCommand = getCommands();

	for (const cmd of allCommand) {
		const disposable = commands.registerTextEditorCommand(cmd.command, (editor, edit, args) => {
			const navigator = new Navigator(editor, edit);
			cmd.handler(navigator, args);
		});
		context.subscriptions.push(disposable);
	}
}

export function deactivate(context: ExtensionContext) { }