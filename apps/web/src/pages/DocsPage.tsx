import { Plus } from "lucide-react";
import { CodeBlock } from "@/components/ui/CodeBlock";

const REPO_URL = "https://github.com/devfellowship/skills";

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="m-0 mb-[14px] font-heading text-[22px] font-semibold uppercase tracking-[.02em] text-foreground">
      {children}
    </h2>
  );
}

const InlineCode = ({ children }: { children: string }) => (
  <code className="rounded-[5px] bg-[hsl(215_15%_15%)] px-[6px] py-0.5 font-mono text-[13px] text-[hsl(33_82%_66%)]">
    {children}
  </code>
);

export function DocsPage() {
  return (
    <main className="mx-auto max-w-[820px] animate-fadeUp px-6 pb-[90px] pt-12">
      <div className="mb-[18px] inline-flex items-center gap-[7px] rounded-full border border-[hsl(33_90%_55%/.22)] bg-[hsl(33_90%_55%/.1)] px-[11px] py-[5px]">
        <span className="text-[11px] font-bold uppercase tracking-[.08em] text-[hsl(33_85%_64%)]">
          Documentation
        </span>
      </div>
      <h1 className="m-0 mb-[14px] font-heading text-[46px] font-bold uppercase leading-none">
        Get started with DFL Skills
      </h1>
      <p className="m-0 mb-9 max-w-[600px] text-base text-[hsl(212_12%_64%)]">
        DFL Skills is fully compatible with the stock <InlineCode>skills</InlineCode> CLI — just point
        it at the DevFellowship registry.
      </p>

      <SectionTitle>Install a skill</SectionTitle>
      <div className="mb-[34px] flex flex-col gap-2">
        <CodeBlock
          command="npx skills add devfellowship/skills --skill test-driven-development"
          size="sm"
          copyMessage="Copied"
        />
        <CodeBlock command={'npx skills find "review my PR"'} size="sm" copyMessage="Copied" />
        <CodeBlock command="npx skills update --all" size="sm" copyMessage="Copied" />
      </div>

      <SectionTitle>Point the CLI at DFL</SectionTitle>
      <p className="m-0 mb-[14px] text-[15px] leading-[1.7] text-[hsl(212_13%_68%)]">
        Set the search base so the stock CLI resolves against the DevFellowship registry instead of
        the public one:
      </p>
      <CodeBlock
        command="export SEARCH_API_BASE=https://skills.devfellowship.com"
        size="sm"
        copyMessage="Copied"
        className="mb-[34px]"
      />

      <SectionTitle>Your account</SectionTitle>
      <p className="m-0 mb-[14px] text-[15px] leading-[1.7] text-[hsl(212_13%_68%)]">
        There is one way in: <strong className="font-semibold text-foreground/90">Continue with
        GitHub</strong>. The same button signs you in and signs you up. Your photo, name and email
        come from GitHub, and your profile is your maintainer page at{" "}
        <InlineCode>/u/&lt;your-handle&gt;</InlineCode> — the one that lists what you publish here.
      </p>
      <p className="m-0 mb-[34px] text-[15px] leading-[1.7] text-[hsl(212_13%_68%)]">
        If your GitHub email is the one on your DevFellowship account, the two are joined and you
        keep your access. Signed in to another DFL app without GitHub? The top bar asks you to{" "}
        <strong className="font-semibold text-foreground/90">Connect GitHub</strong> once.
      </p>

      <SectionTitle>Internal skills</SectionTitle>
      <p className="m-0 mb-[14px] text-[15px] leading-[1.7] text-[hsl(212_13%_68%)]">
        Skills marked <InlineCode>internal</InlineCode> live in the private repository{" "}
        <InlineCode>devfellowship/internal-skills</InlineCode> and show up once you sign in with a
        DevFellowship member account. You don't need access to that repository.
      </p>
      <p className="m-0 mb-[14px] text-[15px] leading-[1.7] text-[hsl(212_13%_68%)]">
        If a skill is listed for you, you can read it. Every internal skill hands you its full
        text through{" "}
        <strong className="font-semibold text-foreground/90">Copy install prompt</strong> or{" "}
        <strong className="font-semibold text-foreground/90">Download SKILL.md</strong> — the
        registry reads the file server-side, so your browser never touches the repository. Skills
        that shouldn't be shared this widely are moved to a narrower tier instead, and then they
        don't show up at all.
      </p>
      <p className="m-0 mb-[14px] text-[15px] leading-[1.7] text-[hsl(212_13%_68%)]">
        <strong className="font-semibold text-foreground/90">Copy install prompt</strong> asks your
        agent to call <InlineCode>install_skill</InlineCode> on the DFL Forge MCP server at{" "}
        <InlineCode>https://skills.mcp.devfellowship.com/mcp</InlineCode>, which returns the file
        and the path to write it to. It authenticates with your DevFellowship account, so an
        internal skill installs without access to its repository.
      </p>
      <p className="m-0 mb-[34px] text-[15px] leading-[1.7] text-[hsl(212_13%_68%)]">
        The CLI clones the source repository instead, so installing an internal skill through{" "}
        <InlineCode>npx skills add</InlineCode> also requires GitHub access to that repository.
      </p>

      <SectionTitle>Publish a skill</SectionTitle>
      <p className="m-0 mb-[18px] text-[15px] leading-[1.7] text-[hsl(212_13%_68%)]">
        Open a pull request adding <InlineCode>skills/&lt;name&gt;/SKILL.md</InlineCode> to{" "}
        <InlineCode>devfellowship/skills</InlineCode>. Set <InlineCode>author:</InlineCode> in the
        frontmatter to your GitHub handle, and run{" "}
        <InlineCode>bun scripts/codeowners.ts --write</InlineCode> in the same PR. Once merged, the registry indexes it and it appears
        here.
      </p>
      <div className="mb-[34px] flex flex-wrap gap-3">
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-[38px] items-center justify-center gap-2 rounded-lg bg-primary px-4 text-[13.5px] font-bold text-primary-foreground transition-colors hover:bg-[hsl(33_92%_60%)]"
        >
          <Plus className="h-[15px] w-[15px]" strokeWidth={2.2} />
          Open a PR
        </a>
      </div>

      <SectionTitle>Ownership and review</SectionTitle>
      <p className="m-0 mb-[14px] text-[15px] leading-[1.7] text-[hsl(212_13%_68%)]">
        Every skill and pack has one owner: its <InlineCode>author:</InlineCode> GitHub handle. A
        pack's owner is its root skill's author. No <InlineCode>author:</InlineCode> means the DFL
        core team owns it.
      </p>
      <p className="m-0 mb-[14px] text-[15px] leading-[1.7] text-[hsl(212_13%_68%)]">
        A change to a skill or pack merges only with its owner's approval, or a core maintainer's.
        GitHub enforces this with code-owner review, from a{" "}
        <InlineCode>CODEOWNERS</InlineCode> file generated from every <InlineCode>author:</InlineCode>{" "}
        field. Editing that file by hand gains nothing: core owns it, and CI checks it against the
        generator.
      </p>
      <p className="m-0 mb-[14px] text-[15px] leading-[1.7] text-[hsl(212_13%_68%)]">
        A new skill or pack needs core approval, which checks that{" "}
        <InlineCode>author:</InlineCode> is you. Changing <InlineCode>author:</InlineCode> itself
        needs the current owner's approval — GitHub reads owners from the target branch, not from
        your PR, so the PR that renames the owner still needs the old one.
      </p>
      <p className="m-0 mb-[34px] text-[15px] leading-[1.7] text-[hsl(212_13%_68%)]">
        Every maintainer has a page listing what they own, at{" "}
        <InlineCode>skills.devfellowship.com/u/&lt;handle&gt;</InlineCode>.
      </p>
    </main>
  );
}
