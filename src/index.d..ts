import { MonacoEditorBaseProps } from 'react-monaco-editor/src/index';

export interface CodeBit {
  start: string;
  end: string;
  children: Array<CodeBit> | string;
}
export interface ActionButtons {
  caption: string;
  onclick: () => void;
}

export interface MonacoSurferPropTypes {
  codeBits: CodeBit;
  highlightedCodePath?: string | null | undefined;
  highlightOnly: boolean;
  onClickBit: (codeBit: any, path: string) => void;
  reactMonacoProps: MonacoEditorBaseProps;
  addActionButtons?: (
    codeBit: CodeBit | string,
    highlightedCodePath: string
  ) => Array<ActionButtons>;
}
export interface MappingDetails {
  lineNumber: number;
  columnNumber: number;
}

export interface MapObject {
  start: MappingDetails;
  end: MappingDetails;
}

export interface MapType {
  start?: boolean;
  end?: boolean;
  children?: boolean;
}
