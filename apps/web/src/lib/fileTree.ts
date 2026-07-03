import type { SkillFile } from "@/data/types";

export interface FileTreeRow {
  name: string;
  isFile: boolean;
  depth: number;
  size: string;
}

interface TreeNode {
  name: string;
  isFile: boolean;
  children: Record<string, TreeNode>;
}

const SIZES = ["1.2 KB", "3.4 KB", "840 B", "2.1 KB", "5.6 KB", "920 B", "4.0 KB"];

export function buildTree(files: SkillFile[]): FileTreeRow[] {
  const root: TreeNode = { name: "", isFile: false, children: {} };

  for (const f of files) {
    const parts = f.path.split("/");
    let node = root;
    parts.forEach((p, i) => {
      const existing = node.children[p];
      const next: TreeNode =
        existing ?? { name: p, isFile: i === parts.length - 1, children: {} };
      node.children[p] = next;
      node = next;
    });
  }

  const rows: FileTreeRow[] = [];
  let sizeIndex = 0;

  const walk = (node: TreeNode, depth: number): void => {
    const keys = Object.keys(node.children).sort((a, b) => {
      const A = node.children[a];
      const B = node.children[b];
      if (!A || !B) return 0;
      if (A.isFile !== B.isFile) return A.isFile ? 1 : -1;
      return a.localeCompare(b);
    });
    for (const k of keys) {
      const c = node.children[k];
      if (!c) continue;
      rows.push({
        name: c.isFile ? k : `${k}/`,
        isFile: c.isFile,
        depth,
        size: c.isFile ? SIZES[sizeIndex++ % SIZES.length] ?? "" : "",
      });
      walk(c, depth + 1);
    }
  };

  walk(root, 0);
  return rows;
}
