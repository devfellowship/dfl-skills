import assert from "node:assert/strict";
import { test } from "node:test";

import {
  COLUMN_GAP_PX,
  DESCRIPTION_MIN_PX,
  GRID_BREAKPOINT_PX,
  GRID_COLS,
  ROW_PADDING_X_PX,
  TRACKS_PX,
} from "../src/consts/pack-member-table.ts";

/** The pack page: `max-w-[1200px] px-6`, and a 360px side panel after a 32px gap. */
const TABLE_WIDTH_BESIDE_PANEL = 1200 - 2 * 24 - 360 - 32;

function fixedWidth(): number {
  const fixed = TRACKS_PX.reduce<number>((sum, px) => sum + (px ?? 0), 0);
  const gaps = (TRACKS_PX.length - 1) * COLUMN_GAP_PX;
  return fixed + gaps + 2 * ROW_PADDING_X_PX;
}

test("the Description keeps its minimum width at the grid breakpoint", () => {
  assert.ok(
    GRID_BREAKPOINT_PX - fixedWidth() >= DESCRIPTION_MIN_PX,
    `Description gets ${GRID_BREAKPOINT_PX - fixedWidth()}px at the breakpoint`,
  );
});

test("the table beside the side panel is wide enough for the grid", () => {
  assert.ok(TABLE_WIDTH_BESIDE_PANEL >= GRID_BREAKPOINT_PX);
  assert.ok(TABLE_WIDTH_BESIDE_PANEL - fixedWidth() >= DESCRIPTION_MIN_PX);
});

test("the Tailwind class literal matches the numbers", () => {
  const tracks = TRACKS_PX.map((px, i) =>
    px === null ? `minmax(${DESCRIPTION_MIN_PX}px,1fr)` : i === 0 ? `minmax(0,${px}px)` : `${px}px`,
  ).join("_");
  assert.equal(GRID_COLS, `@min-[${GRID_BREAKPOINT_PX}px]:grid-cols-[${tracks}]`);
});
