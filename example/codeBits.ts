export default {
  start: '',
  end: '',
  children: [
    {
      start: '',
      end: '',
      children: [
        'import x from "x";\n',
        'import x from "x";\n',
        'import x from "x";\n',
        'import x from "x";\n',
        'import x from "x";\n',
      ],
    },
    {
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
                  end: '</Text>\n',
                  children: [
                    { start: '', end: '', children: 'Enter some text here' },
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
              children: ['\t\t\tSome other text here\n'],
            },
          ],
        },
      ],
    },
  ],
};
