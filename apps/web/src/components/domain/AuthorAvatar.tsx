import { Link } from "react-router-dom";
import { githubAvatarUrl } from "@/lib/format";
import { maintainerHref } from "@/lib/maintainer";

interface AuthorAvatarProps {
  handle: string;
  size?: number;
  className?: string;
  /** Link the avatar to the handle's maintainer profile. Omit for a bare avatar. */
  linked?: boolean;
}

export function AuthorAvatar({ handle, size = 16, className = "", linked = false }: AuthorAvatarProps) {
  const img = (
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
  if (!linked) return img;
  return (
    <Link to={maintainerHref(handle)} onClick={(e) => e.stopPropagation()} className="shrink-0">
      {img}
    </Link>
  );
}
