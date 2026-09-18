import type { Pack } from "@/types";
import { RING_COLOR } from "@/consts/pack-graph";
import { roleShares } from "@/lib/pack-home";

/** A segmented bar of the pack's roles, in the graph's colours, with a legend. */
export function PackRoleBar({ pack }: { pack: Pack }) {
  const shares = roleShares(pack);
  if (shares.length === 0) return null;

  return (
    <div data-testid="pack-role-bar">
      <div className="flex h-[5px] w-full gap-[2px] overflow-hidden rounded-full">
        {shares.map((s) => (
          <span
            key={s.role}
            style={{ flexGrow: s.count, backgroundColor: RING_COLOR[s.role] }}
            className="block h-full min-w-[4px] rounded-full"
            title={`${s.count} ${s.role}`}
          />
        ))}
      </div>
      <ul className="m-0 mt-[7px] flex list-none flex-wrap gap-x-[12px] gap-y-[3px] p-0 text-[11px] text-[hsl(212_10%_56%)]">
        {shares.map((s) => (
          <li key={s.role} className="flex items-center gap-[5px]">
            <span
              className="inline-block h-[7px] w-[7px] rounded-full"
              style={{ backgroundColor: RING_COLOR[s.role] }}
            />
            <span className="font-semibold text-[hsl(212_13%_74%)]">{s.count}</span> {s.role}
          </li>
        ))}
      </ul>
    </div>
  );
}
