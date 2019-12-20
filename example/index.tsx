import * as React from 'react';
import * as ReactDOM from 'react-dom';
import MonacoSurfer from '../.';
import * as SurferTypes from '../dist/index.d.';
import './index.css';
import CodeBits from './codeBits';
import * as monacoEditorTypes from 'monaco-editor/esm/vs/editor/editor.api';

const editorWillMount = (monaco: typeof monacoEditorTypes) => {
  // Handle editor starts mounting here!!
};

const onChange = (
  newValue: string,
  event: monacoEditorTypes.editor.IModelContentChangedEvent
) => {
  // Handle on text changed in editor!!
};

class App extends React.Component {
  state = {
    highlightedCodePaths: [
      'CodeBit.children.1.children.0',
      'CodeBit.children.0.children.1',
    ],
    scrollToPath: '',
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
      <React.Fragment>
        <MonacoSurfer
          codeBits={CodeBits}
          highlightedCodePaths={this.state.highlightedCodePaths}
          scrollToPath={this.state.scrollToPath}
          onClickBit={(codeBit: SurferTypes.CodeBit, codeBitPath: string) => {
            this.setState({
              highlightedCodePaths: codeBitPath,
              // scrollToPath: codeBitPath,
            });
          }}
          addActionButtons={(
            codeBit: SurferTypes.CodeBit,
            codeBitPath: string
          ) => {
            if (
              codeBitPath === 'CodeBit.children.1.children.0.children.0' ||
              codeBitPath === 'CodeBit.children.1.children.1.children.0'
            )
              return () => (
                <div className="btn-container">
                  <button onClick={() => {}} className="action-btn">
                    <text className="btn-text">Export</text>
                  </button>
                  <button onClick={() => {}} className="action-btn-right">
                    <text className="btn-text">Refractor</text>
                  </button>
                </div>
              );
            return null;
          }}
          reactMonacoProps={{
            onChange: onChange,
            editorWillMount: editorWillMount,
            width: '100%',
            height: '100vh',
          }}
        ></MonacoSurfer>
      </React.Fragment>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
