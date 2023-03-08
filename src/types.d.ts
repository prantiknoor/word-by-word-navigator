import Navigator from "./Navigator";

export type TextRange = { start: number, end: number };
export type Command = { command: string, handler: (navigator: Navigator, ...args: any[]) => void }
