export function formatCount(n: number): string {
  if (n >= 1000) {
    const value = (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "");
    return `${value}k`;
  }
  return String(n);
}

export function sparkPath(trend: number[]): string {
  const w = 60;
  const h = 18;
  const max = Math.max(...trend);
  const min = Math.min(...trend);
  const range = max - min || 1;
  return trend
    .map((v, i) => {
      const x = (i / (trend.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

export function installCommand(source: string, slug: string): string {
  return `npx skills add ${source}/${slug}`;
}
