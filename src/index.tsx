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
  decorationId: Array<string> = [];
  activeContentWidgets: Array<monacoEditorTypes.editor.IContentWidget> = [];
  codeBitsMap: Map<string, MapObject> = new Map<string, MapObject>();
  reverseCodeBitsMap: Array<Array<string>> = new Array<Array<string>>();

  componentDidMount() {
    const {
      highlightedCodePaths,
      onClickBit,
      codeBits,
      scrollToPath,
    } = this.props;
    if (highlightedCodePaths) {
      this.highlightAndAddActionButtons(highlightedCodePaths);
    }
    if (scrollToPath) this.scroll(scrollToPath);

    if (this.monacoRef && this.monacoRef.editor && onClickBit) {
      this.monacoRef.editor.onDidChangeCursorPosition(
        (
          positionProps: monacoEditorTypes.editor.ICursorPositionChangedEvent
        ) => {
          const path =
            this.reverseCodeBitsMap[positionProps.position.lineNumber][
              positionProps.position.column - 2
            ] ||
            this.reverseCodeBitsMap[positionProps.position.lineNumber][
              positionProps.position.column - 1
            ];

          let extractedBit: CodeBit | string;

          const codePathForBitExtraction: Array<string> = path.split('.');
          codePathForBitExtraction.shift();

          if (!codePathForBitExtraction.length) extractedBit = codeBits;
          else
            extractedBit = get(codeBits, codePathForBitExtraction, 'NOT_FOUND');
          onClickBit(extractedBit, path);
        }
      );
    }
  }

  componentWillMount = () => {
    const { codeBits } = this.props;
    this.mapCodeBitData(codeBits, 'CodeBit');
  };

  shouldComponentUpdate = (nextProps: MonacoSurferPropTypes) => {
    const { highlightedCodePaths, scrollToPath } = this.props;
    let updateComponent = true;
    if (JSON.stringify(this.props) === JSON.stringify(nextProps)) {
      updateComponent = false;
      return updateComponent;
    }
    if (
      nextProps.highlightedCodePaths &&
      nextProps.highlightedCodePaths !== highlightedCodePaths
    ) {
      this.highlightAndAddActionButtons(nextProps.highlightedCodePaths);
      updateComponent = false;
    }
    if (nextProps.scrollToPath && nextProps.scrollToPath !== scrollToPath) {
      this.scroll(nextProps.scrollToPath);
      updateComponent = false;
    }
    return updateComponent;
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
        } else if (type.children && singleLineCode.length) {
          codeBitMapValue.start.lineNumber = this.lineNumber;
          codeBitMapValue.start.columnNumber = initialReverseMap.length + 1;
          codeBitMapValue.end.lineNumber = this.lineNumber;
          codeBitMapValue.end.columnNumber =
            initialReverseMap.length + singleLineCode.length + 1;
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
      this.code += codeBit.children;

      this.handleMapping(codeBit.end, path, { end: true });

      this.code += codeBit.end;
      return;
    }

    map(codeBit.children, (child: CodeBit | string, childIndex: number) => {
      if (typeof child === 'string') {
        this.handleMapping(child, path + '.children.' + childIndex, {
          children: true,
        });
        this.code += child;
      } else {
        this.mapCodeBitData(child, path + '.children.' + childIndex);
      }
    });

    this.handleMapping(codeBit.end, path, { end: true });
    this.code += codeBit.end;
  };

  highlightAndAddActionButtons = (
    highlightedCodePaths: Array<string> | string
  ) => {
    if (this.activeContentWidgets && this.activeContentWidgets.length) {
      this.removeExistingActionButtonWidgets();
    }
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

      if (typeof highlightedCodePaths !== 'string') {
        map(
          highlightedCodePaths,
          (highlightedCodePath: string, widgetIndex: number) =>
            this.fillNewDecorationsArray(
              highlightedCodePath,
              widgetIndex,
              newDecorationsArray
            )
        );
      } else {
        this.fillNewDecorationsArray(
          highlightedCodePaths,
          0,
          newDecorationsArray
        );
      }
      if (newDecorationsArray.length === 1) {
        newDecorationsArray = [];
        throw new Error('Unable to find any of highlightedCodePaths in map');
      }
      this.decorationId = this.monacoRef.editor.deltaDecorations(
        this.decorationId,
        newDecorationsArray
      );

      return;
    }
  };

  fillNewDecorationsArray = (
    highlightedCodePath: string,
    widgetIndex: number,
    newDecorationsArray: Array<monacoEditorTypes.editor.IModelDeltaDecoration>
  ) => {
    const contentBitMapValue = this.codeBitsMap.get(highlightedCodePath);
    if (!contentBitMapValue) {
      throw new Error(`Unable to find ${highlightedCodePath} path in map`);
    }

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
    this.addActionButtonWidget(highlightedCodePath, widgetIndex);
  };

  scroll = (scrollCodePath: string) => {
    const contentBitMapValue = this.codeBitsMap.get(scrollCodePath);
    if (this.monacoRef && this.monacoRef.editor && contentBitMapValue) {
      this.monacoRef.editor.revealPositionInCenter({
        lineNumber: contentBitMapValue.end.lineNumber,
        column: contentBitMapValue.end.columnNumber,
      });
    } else if (!contentBitMapValue) {
      throw new Error(`Unable to find ${scrollCodePath} in map.`);
    }
  };

  addActionButtonWidget = (widgetCodePath: string, widgetIndex: number) => {
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
            addActionButtons(extractedBit, widgetCodePath),
            widgetIndex
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
    this.activeContentWidgets = [];
  };

  getContentWidget = (
    contentBitMapValue: MapObject,
    MyButtonWidget: React.ElementType<any> | null,
    widgetIndex: number
  ) => {
    if (MyButtonWidget) {
      const contentWidget: monacoEditorTypes.editor.IContentWidget = {
        getId: function() {
          return 'my.content.widget.' + widgetIndex;
        },
        getDomNode: () => {
          var newDomNode = document.createElement('div');
          ReactDOM.hydrate(<MyButtonWidget />, newDomNode);
          return newDomNode;
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
