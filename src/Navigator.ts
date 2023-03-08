import { TextRange } from "./types";
import { Position, Range, Selection, TextDocument, TextEditor, TextEditorEdit, TextEditorRevealType } from "vscode";

export default class Navigator {
    editor: TextEditor;
    edit: TextEditorEdit;
    document: TextDocument;

    camelCaseRegex = /[A-Z]?[a-z0-9]+|[A-Z]+(?![a-z])|[A-Z][a-z0-9]+/g;

    constructor(editor: TextEditor, edit: TextEditorEdit) {
        this.editor = editor;
        this.edit = edit;
        this.document = editor.document;
    }

    public get currentSelection(): Selection {
        return this.editor.selection;
    }

    public getTextOfLine = (line: number) => this.document.lineAt(line).text;

    public getTextFromRange = (range: Range) => this.document.getText(range);

    public getWordRangeAtActive = () => {
        return this.document.getWordRangeAtPosition(this.currentSelection.active);
    };

    public isCurrPosEqualTo = (pos: Position) => this.currentSelection.active.isEqual(pos);

    public deleteText = (range: Range) => this.edit.delete(range);

    public selectText(selection: Selection) {
        this.editor.selection = selection;
        this.editor.revealRange(selection);
    }

    public changeCursorPos(newPos: Position) {
        const selection = new Selection(newPos, newPos);
        this.editor.selection = selection;
        this.editor.revealRange(selection);
    }

    public getMatchTextRange(text: string, reverse = false): TextRange | undefined {
        const matches = text.match(this.camelCaseRegex);
        if (matches) {
            const match = reverse ? matches[matches.length - 1] : matches[0];
            const start = reverse ? text.lastIndexOf(match) : text.indexOf(match);
            return { start, end: start + match.length };
        }
    }

    public getNextMatchSelection(direction: string) {
        const isLeft = direction === 'left';
        const lineCount = this.document.lineCount;
        let currentLine = this.currentSelection.active.line;
        let currCharIndex = this.currentSelection.active.character;

        let text, textRange: TextRange | undefined;

        while (true) {
            text = this.getTextOfLine(currentLine);
            text = isLeft ? text.slice(0, currCharIndex) : text.slice(currCharIndex, text.length);

            textRange = this.getMatchTextRange(text, isLeft);
            if (textRange) { break; }

            if (isLeft) {
                currentLine--;
                if (currentLine >= 0) {
                    currCharIndex = this.getTextOfLine(currentLine).length;
                }
            } else {
                currCharIndex = 0;
                currentLine++;
            }
            if (!(currentLine >= 0 && currentLine < lineCount)) { return; }
        };

        let { start, end } = textRange;

        if (isLeft) {
            [start, end] = [end, start];
        } else {
            start += currCharIndex;
            end += currCharIndex;
        }

        const selection = new Selection(
            new Position(currentLine, start),
            new Position(currentLine, end)
        );
        return selection;
    }

    public getSelections(searchText: string, textRange: TextRange) {
        const regex = new RegExp(`\\b${searchText}\\b`, 'g');
        const selections: Selection[] = [];

        for (let line = 0; line < this.document.lineCount; line++) {
            let match: RegExpExecArray | null;
            const lineText = this.getTextOfLine(line);

            while ((match = regex.exec(lineText)) !== null) {
                const startIndex = match.index;
                const endIndex = match.index + match[0].length;

                selections.push(new Selection(
                    new Position(line, startIndex + textRange.start),
                    new Position(line, endIndex - (searchText.length - textRange.end))
                ));
            }
        }

        return selections;
    }

    public multiSelect(selections: Selection[]) {
        this.editor.selections = selections;
        const lastMatch = selections[selections.length - 1];
        this.editor.revealRange(lastMatch, TextEditorRevealType.InCenter);
    }
}