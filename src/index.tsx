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
  activeContentWidgets: Array<monacoEditorTypes.editor.IContentWidget> = [];
  codeBitsMap: Map<string, MapObject> = new Map<string, MapObject>();
  reverseCodeBitsMap: Array<Array<string>> = new Array<Array<string>>();

  componentDidMount() {
    const { highlightedCodePaths, onClickBit, codeBits } = this.props;
    if (highlightedCodePaths && highlightedCodePaths.length) {
      this.highlightAndScroll(highlightedCodePaths);
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
    console.log(this.code);
  }

  componentWillMount = () => {
    const { codeBits } = this.props;
    this.mapCodeBitData(codeBits, 'CodeBit');
    console.log(this.codeBitsMap);
  };

  shouldComponentUpdate = (nextProps: MonacoSurferPropTypes) => {
    const { highlightedCodePaths } = this.props;
    if (JSON.stringify(this.props) === JSON.stringify(nextProps)) {
      return false;
    }
    if (
      nextProps.highlightedCodePaths &&
      nextProps.highlightedCodePaths.length &&
      nextProps.highlightedCodePaths !== highlightedCodePaths
    ) {
      this.highlightAndScroll(nextProps.highlightedCodePaths);
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
        ].concat(new Array(singleLineCode.length).fill(path));
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
          codeBitMapValue.start.columnNumber = initialReverseMap.length + 1;
        } else if (type.end) {
          codeBitMapValue.end.lineNumber = this.lineNumber;
          codeBitMapValue.end.columnNumber =
            this.reverseCodeBitsMap[this.lineNumber].length + 1;
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
    if (
      typeof codeBit.children === 'string' ||
      typeof codeBit.children[0] === 'string'
    ) {
      if (typeof codeBit.children !== 'string') {
        map(codeBit.children, (codeBitChildString: string) => {
          this.handleMapping(codeBitChildString, path, {
            children: true,
          });
          this.code += codeBitChildString;
        });
      } else {
        this.handleMapping(codeBit.children, path, {
          children: true,
        });
        this.code += codeBit.children;
      }

      this.handleMapping(codeBit.end, path, { end: true });

      this.code += codeBit.end;
      return;
    }

    map(codeBit.children, (child: CodeBit, childIndex: number) => {
      this.mapCodeBitData(child, path + '.children.' + childIndex);
    });

    this.handleMapping(codeBit.end, path, { end: true });
    this.code += codeBit.end;
  };

  highlightAndScroll = (highlightedCodePaths: Array<string> | string) => {
    const { highlightOnly } = this.props;
    if (this.activeContentWidgets && this.activeContentWidgets.length) {
      this.removeExistingActionButtonWidgets();
    }
    if (!highlightOnly) this.scroll(highlightedCodePaths[0]);
    if (this.monacoRef && this.monacoRef.editor) {
      const editorInfo = this.monacoRef.editor.getModel();
      let maxLines: number = 0,
        maxColumns: number = 0;
      if (editorInfo) {
        maxLines = editorInfo.getLineCount();
        maxColumns = editorInfo.getLineMaxColumn(editorInfo.getLineCount());
      }

      let newDecorationsArray = [
        {
          range: new Range(1, 1, maxLines, maxColumns),
          options: {
            inlineClassName: 'dull',
          },
        },
      ];

      map(highlightedCodePaths, (highlightedCodePath: string) => {
        const contentBitMapValue = this.codeBitsMap.get(highlightedCodePath);
        if (!contentBitMapValue) return;

        newDecorationsArray.push({
          range: new Range(
            contentBitMapValue.start.lineNumber,
            contentBitMapValue.start.columnNumber,
            contentBitMapValue.end.lineNumber,
            contentBitMapValue.end.columnNumber
          ),
          options: {
            inlineClassName: 'selected-component',
          },
        });
        this.addActionButtonWidget(highlightedCodePath);
      });
      this.decorationId = this.monacoRef.editor.deltaDecorations(
        this.decorationId,
        newDecorationsArray
      );

      return;
    }
  };

  scroll = (scrollCodePath: string) => {
    const contentBitMapValue = this.codeBitsMap.get(scrollCodePath);
    if (this.monacoRef && this.monacoRef.editor && contentBitMapValue)
      this.monacoRef.editor.revealPositionInCenter({
        lineNumber: contentBitMapValue.end.lineNumber,
        column: contentBitMapValue.end.columnNumber,
      });
  };

  addActionButtonWidget = (widgetCodePath: string) => {
    const { addActionButtons, codeBits } = this.props;
    const contentBitMapValue = this.codeBitsMap.get(widgetCodePath);

    let extractedBit: CodeBit | string;
    const codePathForBitExtraction: Array<string> = widgetCodePath.split('.');
    codePathForBitExtraction.shift();

    if (!codePathForBitExtraction.length) extractedBit = codeBits;
    else extractedBit = get(codeBits, codePathForBitExtraction, 'NOT_FOUND');

    const actionButtons =
      addActionButtons && contentBitMapValue
        ? this.getContentWidget(
            contentBitMapValue,
            addActionButtons(extractedBit, widgetCodePath)
          )
        : null;

    if (this.monacoRef && this.monacoRef.editor && actionButtons) {
      this.monacoRef.editor.addContentWidget(actionButtons);
    }
  };

  removeExistingActionButtonWidgets = () => {
    map(
      this.activeContentWidgets,
      (activeContentWidget: monacoEditorTypes.editor.IContentWidget) => {
        if (this.monacoRef && this.monacoRef.editor) {
          this.monacoRef.editor.removeContentWidget(activeContentWidget);
        }
      }
    );
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
      this.activeContentWidgets.push(contentWidget);
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
