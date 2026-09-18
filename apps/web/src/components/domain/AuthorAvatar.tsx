import { githubAvatarUrl } from "@/lib/format";

interface AuthorAvatarProps {
  handle: string;
  size?: number;
  className?: string;
}

export function AuthorAvatar({ handle, size = 16, className = "" }: AuthorAvatarProps) {
  return (
    <img
      src={githubAvatarUrl(handle)}
      alt=""
      loading="lazy"
      title={handle}
      style={{ width: size, height: size }}
      className={`shrink-0 rounded-full border border-[hsl(215_15%_18%)] bg-[hsl(215_18%_12%)] ${className}`}
      onError={(e) => {
        e.currentTarget.style.visibility = "hidden";
      }}
    />
  );
}
