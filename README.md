# React-Monaco-Surfer

A wrapper around [react-monaco-editor](https://github.com/react-monaco-editor/react-monaco-editor) for Code Surfing.

> This wrapper helps you add your code to the [react-monaco-editor](https://github.com/react-monaco-editor/react-monaco-editor) in a particular format to provide you some pre-build features such as highlighting some part of the code or adding buttons to some part of the text when selected. Also you can track the movement of the cursor in the editor to handle it accordingly

> All the features provided by [react-monaco-editor](https://github.com/react-monaco-editor/react-monaco-editor) remain intact and can be passed in reactMonacoProps.

![](react-monaco-surfer.gif)

## Installation

```
npm install react-monaco-surfer
```

or

```
yarn add react-monaco-surfer
```

## Using

App.ts (check examples folder for better understanding)

```
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import MonacoSurfer from 'react-monaco-surfer';
import * as SurferTypes from 'react-monaco-surfer/dist/index.d.';
import * as monacoEditorTypes from 'monaco-editor/esm/vs/editor/editor.api';
import CodeBits from './codeBits';

// Mention styles for highlighted text and remaining text in this.
import './index.css';

const editorWillMount = (monaco: typeof monacoEditorTypes) => {
  // Handle editor starts mounting here!!
  console.log('editorWillMount', monaco);
};

const onChange = (
  newValue: string,
  event: monacoEditorTypes.editor.IModelContentChangedEvent
) => {
  // Handle on text changed in editor!!
  console.log('onChange', newValue, event);
};

class App extends React.Component {
  state = {
    highlightedCodePath: undefined,
    highlightOnly: false,
  };

  shouldComponentUpdate(nextProps, nextState) {
    if (
      JSON.stringify(nextState) === JSON.stringify(this.state) &&
      JSON.stringify(nextProps) === JSON.stringify(this.props)
    )
      return false;
    return true;
  }

  render() {
    return (
      <MonacoSurfer
        codeBits={CodeBits}
        highlightedCodePath={this.state.highlightedCodePath}
        highlightOnly={this.state.highlightOnly}
        onClickBit={(codeBit: SurferTypes.CodeBit, codeBitPath: string) => {
          this.setState({
            highlightedCodePath: codeBitPath,
            highlightOnly: true,
          });
        }}
        addActionButtons={(
          codeBit: SurferTypes.CodeBit,
          codeBitPath: string
        ) => {
          return ()=>(
            <div>
              <text>
                Action Buttons
              </text>
            </div>
          );
        }}
        reactMonacoProps={{
          width:'100%',
          height:'100%',
          onChange: onChange,
          editorWillMount: editorWillMount,
        }}
      ></MonacoSurfer>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));

```

codeBits.ts

```
export default {
  start: '<View>\n',
  end: '</View>\n',
  children: [
    {
      start: '\t<View>\n',
      end: '\t</View>\n',
      children: [
        {
          start: '\t\t<View>\n',
          end: '\t\t</View>\n',
          children: [
            {
              start: '\t\t\t<Text>',
              end: '\t\t\t</Text>\n',
              children: [
                {
                  start: '',
                  end: '',
                  children: '\t\t\t\tEnter some text here',
                },
              ],
            },
            {
              start: '\t\t\t<Text>\n',
              end: '\t\t\t</Text>\n',
              children: '\t\t\t\tEnter some text here\n',
            },
          ],
        },
      ],
    },
    {
      start: '\t<View>\n',
      end: '\t</View>\n',
      children: [
        {
          start: '\t\t<Text>\n',
          end: '\t\t</Text>\n',
          children: '\t\t\tSome other text here\n',
        },
      ],
    },
  ],
};
```

## Properties

All below mentioned properties are required except addActionButtons and highlightedCodePath

- `codeBits` Object in the format CodeBit (check `src/index.d.ts` for better understanding).

- `highlightedCodePath` Mention the path to code-bit to highlight it (give `undefined`for no highlighting).

- `highlightOnly` Boolean to prevent revealPositionInCenter, if not required.

- `onClickBit` Handle clicks on any part of the code
  `Params`

  - codeBit: Gives object for selected codeBit
  - codeBitPath: Gives path for selected codeBit

- `reactMonacoProps` Can add all props of react-monaco-editor here.

- `addActionButtons` Handle adding action buttons on selected part of the code
  `Params`

  - codeBit: Gives object for selected codeBit
  - codeBitPath: Gives path for selected codeBit

## Required CSS classes

```
.dull{
  // any styles for un-highlighted text
  opacity: 0.4;
}
```

and

```
.selected-component{
  // any styles for highlighted text
  opacity: 1;
}
```
