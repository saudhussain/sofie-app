import type { Preview } from '@storybook/react-vite';
import { Stage } from '../src/stage';
import '../src/styles.css';

const preview = {
  decorators: [
    (Story) => (
      <Stage>
        <Story />
      </Stage>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    options: {
      storySort: {
        order: ['Board', 'Shared', 'Live status', 'Adlibs', '*'],
      },
    },
  },
  tags: ['autodocs'],
} satisfies Preview;

export default preview;
