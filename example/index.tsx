import * as React from 'react';
import * as ReactDOM from 'react-dom';
import MonacoSurfer from '../.';
import * as SurferTypes from '../dist/index.d.';
import './index.css';
import CodeBits from './codeBits';
import * as monacoEditorTypes from 'monaco-editor/esm/vs/editor/editor.api';

const editorWillMount = (monaco: typeof monacoEditorTypes) => {
  // Handle editor starts mounting here!!
  // console.log('editorWillMount', monaco);
};

const onChange = (
  newValue: string,
  event: monacoEditorTypes.editor.IModelContentChangedEvent
) => {
  // Handle on text changed in editor!!
  // console.log('onChange', newValue, event);
};

class App extends React.Component {
  state = {
    highlightedCodePath: undefined,
    highlightOnly: false,
  };

  // Must to handle(helps stop re-rendering of text-editor if editing text in editor)
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
          // console.log(codeBit, '##');
          this.setState({
            highlightedCodePath: codeBitPath,
            highlightOnly: true,
          });
        }}
        addActionButtons={(
          codeBit: SurferTypes.CodeBit,
          codeBitPath: string
        ) => {
          // console.log(codeBit, '$$');
          if (codeBitPath === 'CodeBit.children.0.children.0')
            return () => (
              <div
                style={{
                  backgroundColor: 'grey',
                  display: 'flex',
                  flexDirection: 'row',
                  height: '50px',
                  width: '300px',
                }}
              >
                <button
                  onClick={() => {
                    console.log('export as component');
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                >
                  <text>Export as component</text>
                </button>
                <button
                  onClick={() => {
                    console.log('refractor');
                  }}
                  style={{ width: '100%', height: '100%' }}
                >
                  <text>Refractor</text>
                </button>
              </div>
            );
          return null;
        }}
        reactMonacoProps={{
          // All React-Monaco-Editor props can be given here to override default's
          onChange: onChange,
          editorWillMount: editorWillMount,
          width: '100%',
          height: '100vh',
        }}
      ></MonacoSurfer>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
