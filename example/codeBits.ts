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
