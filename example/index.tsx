import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import MonacoSurfer from '../.';
import * as SurferTypes from '../dist/index.d.';
import './index.css';
import CodeBits from './codeBits';

const editorWillMount = (editor: any, monaco: any) => {
  // Handle editor starts mounting here!!
  // console.log('editorWillMount', editor, monaco);
};

const onChange = (newValue: any, event: any) => {
  // Handle on text changed in editor!!
  // console.log('onChange', e);
};

class App extends React.Component {
  state = {
    highlightedCodePath: undefined,
    highlightOnly: false,
  };

  // Must to handle(helps stop re-rendering of text-editor if editing text in editor)
  shouldComponentUpdate(nextProps, nextState) {
    if (JSON.stringify(nextState) === JSON.stringify(this.state)) return false;
    return true;
  }
  render() {
    return (
      <MonacoSurfer
        codeBits={CodeBits}
        highlightedCodePath={this.state.highlightedCodePath}
        highlightOnly={this.state.highlightOnly}
        onClickBit={(object: any, path: string) => {
          // Handle clicks on any part of the code
          this.setState({ highlightedCodePath: path, highlightOnly: true });
        }}
        addActionButtons={(
          codeBit: SurferTypes.CodeBit,
          codeBitPath: string
        ) => {
          console.log(codeBit);
          if (codeBitPath === 'CodeBit.children.0.children.0')
            return [
              {
                caption: 'Export as component',
                onclick: () => {
                  console.log('export as component');
                },
              },
              {
                caption: 'Refractor',
                onclick: () => {
                  console.log('refractor');
                },
              },
            ];
          return [];
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
