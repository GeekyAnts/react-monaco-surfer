import { MonacoEditorProps } from 'react-monaco-editor/src/index';

export interface CodeBit {
  start: string;
  end: string;
  data?: any;
  children: Array<CodeBit | string> | string;
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

export interface MonacoSurferPropTypes {
  /*
    Add code value in above mentioned format 
  */
  codeBits: CodeBit;

  /*
    Mention the path to code-bit to highlight it (give undefined for no highlighting)
  */
  highlightedCodePaths?: Array<string> | string | null | undefined;

  scrollToPath?: string;

  /*
    Handle clicks on any part of the code
      - codeBit: Gives object for selected codeBit
      - codeBitPath: Gives path for selected codeBit
  */
  onClickBit?: (codeBit: CodeBit | string, codeBitPath: string) => void;

  /*
    Add all props of react-monaco-editor here
  */
  reactMonacoProps: MonacoEditorProps;

  /*
    Handle adding action buttons on selected part of the code
      - codeBit: Gives object for selected codeBit
      - codeBitPath: Gives path for selected codeBit
  */
  addActionButtons?: (
    codeBit: CodeBit | string,
    codeBitPath: string
  ) => React.ElementType<any> | null;
}
