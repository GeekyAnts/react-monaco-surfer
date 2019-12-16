import React, { Component } from 'react';
import * as ReactDOM from 'react-dom';
import MonacoEditor from 'react-monaco-editor';
import { Range } from 'monaco-editor';
import map from 'lodash/map';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import { MonacoSurferPropTypes, MapObject, CodeBit, MapType } from './index.d.';
import * as monacoEditorTypes from 'monaco-editor/esm/vs/editor/editor.api';
import MonacoEditorTypes from 'react-monaco-editor/src/index';

const options = {
  selectOnLineNumbers: true,
  fontSize: 30,
  language: 'javascript',
  readOnly: true,
};

export default class MonacoSurfer extends Component<MonacoSurferPropTypes> {
  lineNumber: number = 1;
  code: string = '';
  monacoRef?: MonacoEditorTypes | null;
  contentWidgetDomNode?: HTMLElement;
  decorationId: Array<string> = [];
  activeContentWidget:
    | monacoEditorTypes.editor.IContentWidget
    | undefined = undefined;
  codeBitsMap: Map<string, MapObject> = new Map<string, MapObject>();
  reverseCodeBitsMap: Array<Array<string>> = new Array<Array<string>>();

  componentDidMount() {
    const { highlightedCodePath, onClickBit, codeBits } = this.props;
    if (highlightedCodePath) {
      this.highlightAndScroll(highlightedCodePath);
    }
    if (this.monacoRef && this.monacoRef.editor) {
      this.monacoRef.editor.onDidChangeCursorPosition(
        (
          positionProps: monacoEditorTypes.editor.ICursorPositionChangedEvent
        ) => {
          const path = this.reverseCodeBitsMap[
            positionProps.position.lineNumber
          ][positionProps.position.column - 1];

          let extractedBit: CodeBit;

          const codePathForBitExtraction: Array<string> = path.split('.');
          codePathForBitExtraction.shift();

          if (!codePathForBitExtraction.length) extractedBit = codeBits;
          else
            extractedBit = get(codeBits, codePathForBitExtraction, 'NOT_FOUND');

          onClickBit(
            extractedBit,
            this.reverseCodeBitsMap[positionProps.position.lineNumber][
              positionProps.position.column - 1
            ]
          );
        }
      );
    }
  }

  componentWillMount = () => {
    const { codeBits } = this.props;
    this.mapCodeBitData(codeBits, 'CodeBit');
  };

  shouldComponentUpdate = (nextProps: MonacoSurferPropTypes) => {
    const { highlightedCodePath } = this.props;
    if (JSON.stringify(this.props) === JSON.stringify(nextProps)) {
      return false;
    }
    if (
      nextProps.highlightedCodePath &&
      nextProps.highlightedCodePath !== highlightedCodePath
    ) {
      this.highlightAndScroll(nextProps.highlightedCodePath);
      return false;
    }
    return true;
  };

  /*
    Handles single child of the codeBit and maps line number and column numbers for highlighting
  */
  handleMapping = (codeString: string, path: string, type: MapType) => {
    let codeStringArray = codeString.split('\n');
    map(
      codeStringArray,
      (singleLineCode: string, singleLineCodeIndex: number) => {
        const initialReverseMap =
          cloneDeep(this.reverseCodeBitsMap[this.lineNumber]) || [];

        // Create reverse map
        this.reverseCodeBitsMap[this.lineNumber] =
          this.reverseCodeBitsMap[this.lineNumber] || [];
        this.reverseCodeBitsMap[this.lineNumber] = this.reverseCodeBitsMap[
          this.lineNumber
        ].concat(new Array(singleLineCode.length + 1).fill(path));
        // Reverse map complete

        // Create forward map
        let codeBitMapValue = cloneDeep(this.codeBitsMap.get(path)) || {
          start: {
            lineNumber: 1,
            columnNumber: 1,
          },
          end: {
            lineNumber: 1,
            columnNumber: 1,
          },
        };

        if (type.start && !singleLineCodeIndex) {
          codeBitMapValue.start.lineNumber = this.lineNumber;
          codeBitMapValue.start.columnNumber = initialReverseMap.length;
        } else if (type.end) {
          codeBitMapValue.end.lineNumber = this.lineNumber;
          codeBitMapValue.end.columnNumber =
            this.reverseCodeBitsMap[this.lineNumber].length - 1;
        }
        this.codeBitsMap.set(path, codeBitMapValue);
        // Forward map complete

        this.lineNumber++;
      }
    );

    this.lineNumber -= 1;
  };

  /*
    Recursive calls for mapping codeBits
  */
  mapCodeBitData = (codeBit: CodeBit, path: string) => {
    this.handleMapping(codeBit.start, path, { start: true });
    this.code += codeBit.start;

    // End recursive calls if children is of type string i.e. leaf node
    if (typeof codeBit.children === 'string') {
      this.handleMapping(codeBit.children, path, {
        children: true,
      });
      this.handleMapping(codeBit.end, path, { end: true });

      this.code += codeBit.children;
      this.code += codeBit.end;
      return;
    }

    map(codeBit.children, (child: CodeBit, childIndex: number) => {
      this.mapCodeBitData(child, path + '.children.' + childIndex);
    });

    this.handleMapping(codeBit.end, path, { end: true });
    this.code += codeBit.end;
  };

  highlightAndScroll = (highlightedCodePath: string) => {
    if (this.monacoRef && this.monacoRef.editor) {
      const { addActionButtons, highlightOnly, codeBits } = this.props;
      const contentBitMapValue = this.codeBitsMap.get(highlightedCodePath);
      if (!contentBitMapValue) return;

      // Remove previously existing widget
      if (this.activeContentWidget)
        this.monacoRef.editor.removeContentWidget(this.activeContentWidget);

      // Reveals code in center of screen
      if (!highlightOnly)
        this.monacoRef.editor.revealPositionInCenter({
          lineNumber: contentBitMapValue.end.lineNumber,
          column: contentBitMapValue.end.columnNumber,
        });

      // Add action button widget
      let extractedBit: CodeBit | string;
      const codePathForBitExtraction: Array<string> = highlightedCodePath.split(
        '.'
      );
      codePathForBitExtraction.shift();

      if (!codePathForBitExtraction.length) extractedBit = codeBits;
      else extractedBit = get(codeBits, codePathForBitExtraction, 'NOT_FOUND');

      const actionButtons = addActionButtons
        ? this.getContentWidget(
            contentBitMapValue,
            addActionButtons(extractedBit, highlightedCodePath)
          )
        : null;

      if (actionButtons) {
        this.monacoRef.editor.addContentWidget(actionButtons);
      }

      // Gives api's for editor info
      const editorInfo = this.monacoRef.editor.getModel();
      let maxLines: number = 0,
        maxColumns: number = 0;
      if (editorInfo) {
        maxLines = editorInfo.getLineCount();
        maxColumns = editorInfo.getLineMaxColumn(editorInfo.getLineCount());
      }

      // Add decorations for selected components
      if (editorInfo) {
        this.decorationId = this.monacoRef.editor.deltaDecorations(
          this.decorationId,
          [
            {
              range: new Range(1, 1, maxLines, maxColumns),
              options: {
                inlineClassName: 'dull',
              },
            },
            {
              range: new Range(
                contentBitMapValue.start.lineNumber,
                contentBitMapValue.start.columnNumber,
                contentBitMapValue.end.lineNumber,
                contentBitMapValue.end.columnNumber
              ),
              options: {
                inlineClassName: 'selected-component',
              },
            },
          ]
        );
      }
      return;
    }
  };

  getContentWidget = (
    contentBitMapValue: MapObject,
    MyButtonWidget: React.ElementType<any> | null
  ) => {
    if (MyButtonWidget) {
      const contentWidget: monacoEditorTypes.editor.IContentWidget = {
        getId: function() {
          return 'my.content.widget';
        },
        getDomNode: () => {
          if (!this.contentWidgetDomNode) {
            var newDomNode = document.createElement('div');
            ReactDOM.hydrate(<MyButtonWidget />, newDomNode);
            this.contentWidgetDomNode = newDomNode;
          }
          return this.contentWidgetDomNode;
        },
        getPosition: function() {
          return {
            position: {
              lineNumber: contentBitMapValue.start.lineNumber,
              column: contentBitMapValue.start.columnNumber + 1,
            },
            preference: [
              monacoEditorTypes.editor.ContentWidgetPositionPreference.ABOVE,
              monacoEditorTypes.editor.ContentWidgetPositionPreference.BELOW,
            ],
          };
        },
      };
      this.activeContentWidget = contentWidget;
      return contentWidget;
    }
    return null;
  };

  render() {
    const { reactMonacoProps } = this.props;
    return (
      <div>
        <MonacoEditor
          ref={ref => (this.monacoRef = ref)}
          width="800"
          height="600"
          language="javascript"
          theme="vs-dark"
          value={this.code}
          options={options}
          {...reactMonacoProps}
        ></MonacoEditor>
      </div>
    );
  }
}
