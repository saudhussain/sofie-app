type ListPanelItem = {
  id: string;
  name: string;
};

type ListPanelProps = {
  emptyStateMessage: string;
  headingId: string;
  items: ListPanelItem[];
  title: string;
};

/**
 * Titled list, or the empty-state sentence when there is nothing to show.
 * `headingId` names the section for assistive tech.
 */
export const ListPanel = ({
  emptyStateMessage,
  headingId,
  items,
  title,
}: ListPanelProps) => (
  <section
    aria-labelledby={headingId}
    className="flex h-full min-h-56 flex-col border border-line bg-panel"
  >
    <h2
      className="border-line border-b px-5 py-3 font-medium font-mono text-[11px] text-muted uppercase tracking-[0.2em]"
      id={headingId}
    >
      {title}
    </h2>
    {items.length === 0 ? (
      <p className="px-5 py-6 font-mono text-muted text-sm">
        {emptyStateMessage}
      </p>
    ) : (
      <ul className="min-h-0 flex-1 overflow-y-auto">
        {/* min-h-0 lets this flex child shrink, so a long list scrolls in the panel. */}
        {items.map((item) => (
          <li
            className="border-line border-b px-5 py-3 font-mono text-sm last:border-b-0"
            key={item.id}
          >
            {item.name}
          </li>
        ))}
      </ul>
    )}
  </section>
);
