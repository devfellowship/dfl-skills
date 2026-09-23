/**
 * Layout of the pack member table. The table sits beside a 360px side panel,
 * so on a 1440px screen it is only 760px wide. The columns switch on the width
 * of the TABLE (a container query), not the viewport: between 1024px and
 * 1248px the side panel makes the table narrower than the grid needs, and the
 * rows stack as they do on a phone.
 *
 * The role badge sits under the slug, in the Skill cell, on every width. A
 * separate Role column took 112px that the Description needs.
 *
 * `test/pack-member-table.test.ts` checks that these numbers keep the
 * Description at or above DESCRIPTION_MIN_PX. Keep the literal class strings
 * below in sync with the numbers: Tailwind reads the literals.
 */
export const COLUMN_GAP_PX = 16;
export const ROW_PADDING_X_PX = 18;
export const DESCRIPTION_MIN_PX = 240;

/** Table width at which the rows turn into a grid. */
export const GRID_BREAKPOINT_PX = 740;

/** Fixed tracks, in column order, with the Description as `null`. */
export const TRACKS_PX = [200, 120, null, 96] as const;

export const GRID_COLS =
  "@min-[740px]:grid-cols-[minmax(0,200px)_120px_minmax(240px,1fr)_96px]";
