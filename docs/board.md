# The board

The screen is landscape. A status lamp sits across the top. Under it, two columns: **Adlibs** takes three parts of the width, **Global Adlibs** takes two. The lamp and the copy shown while the gateway is down or the rundown is inactive are in [live-status.md](live-status.md). This note is how a connected rundown is drawn, and what a tap is allowed to change.

## Part adlibs

The wide column shows one segment at a time.

Segments follow the order of the `adLibs` array, which is the rundown order. A segment's label is the title of its Tema adlib. Without one, the label is `Segment N`. An on-air segment that has no adlibs still gets a tab, labelled **On air**, so the strip can show where Sofie is.

The strip puts three segments first:

| Role | Which segment | Mark |
| --- | --- | --- |
| previous | The one just before on air | none |
| current | On air. `currentPart.segmentId`, or `currentSegment.id` when that part is null | On air |
| next | The playlist's next segment, or the following one in the rundown | Next |

The rest stay in rundown order. `aria-current` marks the on-air segment. `aria-pressed` marks the segment whose buttons are open. Those can be different segments.

The board follows Sofie. A tab the operator opens stays pinned until the on-air segment id changes, including when it becomes null. The pin is dropped for good: coming back to that segment does not restore it. When the playlist has not named a current segment, every tab is manual, the first segment is open, and the column says the current segment is unknown.

The name of the open segment stays above the buttons, because the strip scrolls. While another segment is on air, that line also names it.

Inside the segment, adlibs are bucketed by source layer. Tema, Super, Sted, and Grafikk come first, in that order. Any other layer follows, in the order it was first seen. The gateway layer `invalid` is titled Control. An empty layer is titled Other. A layer this app has never seen still gets a heading and its buttons.

Identical titles in one segment are numbered `#1`, `#2`, and so on, in gateway order. A unique title has no number.

## Global adlibs

The narrow column lists every global adlib, whichever segment is open. One section per source layer, in the order the gateway first names that layer. A section whose titles are all numbers is sorted numerically, so camera `10` follows `9`.

An adlib tagged `clear`, `clear_all`, or `exit-bts-dve` is drawn in danger. The colour replaces the cue. The label stays Sofie's.

The column heading shows how many global adlibs are on screen. The count is omitted while the panel is blocked, so a stale total is not left beside the waiting copy.

## Titles

The adapter reads a title in this order:

1. The Nora picture title.
2. Nora `mainText`.
3. The packed gateway name.

Packed names look like `Title; subtitle; variant`. Pieces are split on `;`. A trailing literal `variant` is dropped. The second piece becomes the subtitle only when Nora did not already supply a title.

On the control, the second line is the picture credit when there is one. Otherwise it is Nora `secondaryText`, then the picture creators, then that packed subtitle. A duration comes from `noraTiming.duration` and is shown in seconds, with a tenth when the value is not whole. The thumbnail is the Nora picture URL.

A payload that is missing or not JSON leaves the packed name in place. The same payload string is parsed once and cached. A failed payload is cached too.

## Controls

`Pressable` is the only clickable control. It turns off the browser's tap delay and draws its own press flash. The caller decides what the tap means.

| Shape | When | What a tap posts |
| --- | --- | --- |
| Whole face | One action, or none | That action's name, or the id alone when there is no action |
| Header plus zones | Two to four actions | The header is not a button. Each zone posts that action's name |
| Disclosure | More than four actions | The zones mount only while it is open. Sofie's routing adlibs carry 56 each |

A completed press posts. The request, the labels **Sending**, **Sent**, **Not on air**, and **Failed**, and the rule that a second tap on that control does nothing while the request is in flight, are in [live-status.md](live-status.md).

A segment tab changes which segment is drawn. Opening a disclosure shows that adlib's actions. Neither of those takes a part in Sofie.

## Code

| File | Role |
| --- | --- |
| `web-app/src/features/adlibs/model/adapter.ts` | Title, group, duration, and thumbnail |
| `web-app/src/features/adlibs/model/segments.ts` | Segment tabs and layer buckets |
| `web-app/src/features/adlibs/model/group-globals.ts` | Global sections and danger tags |
| `web-app/src/features/adlibs/components/local-panel/index.tsx` | The wide column and the pin |
| `web-app/src/features/adlibs/components/global-panel/index.tsx` | The narrow column |
| `web-app/src/features/adlibs/components/adlib-control/index.tsx` | Picks a single face or a split control |
| `web-app/src/shared/ui/pressable/index.tsx` | The button every tap goes through |
