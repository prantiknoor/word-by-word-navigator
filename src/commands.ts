import Navigator from "./Navigator";
import { Command } from "./types";

const identifier = 'word-by-word-navigator';

export function getCommands(): Command[] {
    const commands: Command[] = [
        {
            command: `${identifier}.navigateCursor`,
            handler: navigateCursorToNextMatch
        },
        {
            command: `${identifier}.selectNextMatch`,
            handler: selectNextMatch
        },
        {
            command: `${identifier}.deleteNextMatch`,
            handler: deleteNextMatch
        }
    ];
    return commands;
}

function navigateCursorToNextMatch(navigator: Navigator, direction: string) {
    const selection = navigator.getNextMatchSelection(direction);
    if (selection) {
        let start = selection.start, end = selection.end;
        if (direction === 'left') {
            [start, end] = [end, start];
        }
        const newPos = navigator.isCurrPosEqualTo(start) ? end : start;
        navigator.changeCursorPos(newPos);
    }
}

function selectNextMatch(navigator: Navigator, direction: string) {
    const selection = navigator.getNextMatchSelection(direction);
    if (selection) {
        navigator.selectText(selection);
    }
}

function deleteNextMatch(navigator: Navigator, direction: string) {
    const range = navigator.getNextMatchSelection(direction);
    if (range) {
        if (!navigator.isCurrPosEqualTo(range.start)) {
            navigator.changeCursorPos(range.start);
        };
        navigator.deleteText(range);
    }
}