import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { SegmentChip } from '@/features/adlibs/components/segment-strip/segment-chip';
import { interviewTab, ministerTab, openingTab, weatherTab } from '../fixtures';

const meta = {
  args: {
    onSelect: fn(),
    selected: false,
    tab: interviewTab,
  },
  component: SegmentChip,
  title: 'Adlibs/Segment chip',
} satisfies Meta<typeof SegmentChip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OnAir: Story = {};

export const OnAirAndOpen: Story = {
  args: { selected: true },
};

export const Next: Story = {
  args: { tab: weatherTab },
};

export const Previous: Story = {
  args: { tab: openingTab },
};

export const Open: Story = {
  args: { selected: true, tab: openingTab },
};

export const LongLabel: Story = {
  args: { tab: ministerTab },
};
