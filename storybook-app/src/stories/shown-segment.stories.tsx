import type { Meta, StoryObj } from '@storybook/react-vite';
import { ShownSegment } from '@/features/adlibs/components/local-panel/shown-segment';
import { interviewTab, openingTab, weatherTab } from '../fixtures';

const meta = {
  args: {
    onAir: interviewTab,
    showing: interviewTab,
  },
  component: ShownSegment,
  title: 'Adlibs/Shown segment',
} satisfies Meta<typeof ShownSegment>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OnAir: Story = {};

export const AnotherSegment: Story = {
  args: { showing: weatherTab },
};

export const PreviousSegment: Story = {
  args: { showing: openingTab },
};

export const UnknownOnAir: Story = {
  args: { onAir: undefined, showing: weatherTab },
};
