import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { SegmentStrip } from '@/features/adlibs/components/segment-strip';
import { longSegmentTabs, segmentTabs } from '../fixtures';

const meta = {
  args: {
    onSelect: fn(),
    selectedId: 'interview',
    tabs: segmentTabs,
  },
  component: SegmentStrip,
  title: 'Adlibs/Segment strip',
} satisfies Meta<typeof SegmentStrip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Rundown: Story = {};

export const Scrolling: Story = {
  args: { tabs: longSegmentTabs },
  render: (args) => (
    <div className="w-96 border border-line">
      <SegmentStrip {...args} />
    </div>
  ),
};

function SelectableStrip() {
  const [selectedId, setSelectedId] = useState<string | null>('interview');
  return (
    <div className="w-96 border border-line">
      <SegmentStrip
        onSelect={setSelectedId}
        selectedId={selectedId}
        tabs={longSegmentTabs}
      />
    </div>
  );
}

export const Selectable: Story = {
  render: () => <SelectableStrip />,
};
