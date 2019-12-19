export default {
  start: '',
  end: '',
  children: [
    {
      start: '',
      end: '',
      children: [
        'import React from "react";\n',
        'import { View, Text } from "react-native";\n\n',
      ],
    },
    {
      start: 'class App extends React.Component{\nrender(){\n\treturn(\n',
      end: '\t\t)\n\t};\n}\n',
      children: [
        {
          start: '\t\t<View>\n',
          end: '\t\t</View>\n',
          children: [
            {
              start: '\t\t\t<View>\n',
              end: '\t\t\t</View>\n',
              children: [
                {
                  start: '\t\t\t\t<View>\n',
                  end: '\t\t\t\t</View>\n',
                  children: [
                    {
                      start: '\t\t\t\t\t<Text>',
                      end: '</Text>\n',
                      children: [
                        {
                          start: '',
                          end: '',
                          children: 'Enter some text here',
                        },
                      ],
                    },
                    {
                      start: '\t\t\t\t\t<Text>\n',
                      end: '\t\t\t\t\t</Text>\n',
                      children: '\t\t\t\t\t\tEnter some text here\n',
                    },
                  ],
                },
              ],
            },
            {
              start: '\t\t\t<View>\n',
              end: '\t\t\t</View>\n',
              children: [
                {
                  start: '\t\t\t\t<Text>\n',
                  end: '\t\t\t\t</Text>\n',
                  children: ['\t\t\t\t\tSome other text here\n'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      start: '',
      end: '',
      children: 'export default App;',
    },
  ],
};
