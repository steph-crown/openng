import { buildApiUrl } from "../../../lib/api-base-url";

export function AnybodyCanWriteSection() {
  const fuelUrl = buildApiUrl("/v1/fuel?state=Lagos&period=2026-03");

  return (
    <section className="mt-[72px]">
      <h2 className="text-center text-[clamp(38px,4.6vw,62px)] leading-[1.05] tracking-[-0.02em] text-[var(--color-brand)]">
        Any language. Any tool. Any environment.
      </h2>
      <p className="mx-auto mb-7 mt-5 max-w-[800px] text-center leading-[1.65] text-[var(--color-muted)]">
        OpenNG is HTTP. If your language can make a network request, it can use
        OpenNG.
      </p>
      <div className="grid grid-cols-2 gap-5 max-[960px]:grid-cols-1">
        <article className="min-h-[320px] rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-[18px]">
          <pre className="m-0 font-[var(--font-mono)] text-[13px] leading-[1.6] text-[#d4d4d8]">
            <code className="grid gap-0.5">
              <span className="block">
                <span className="text-[#9ca3af]">
                  # Get Nigerian fuel prices for Lagos, March 2026
                </span>
              </span>
              <span className="block">
                <span className="text-[#facc15]">curl</span>{" "}
                <span className="text-[#22c55e]">{`"${fuelUrl}"`}</span>{" "}
                \
              </span>
              <span className="block">
                {"  "}-H{" "}
                <span className="text-[#22c55e]">
                  &quot;Authorization: Bearer ong_live_your_key&quot;
                </span>
              </span>
              <span className="block"></span>
              <span className="block">
                <span className="text-[#f472b6]">const</span> fuel{" "}
                <span className="text-[#f472b6]">=</span>{" "}
                <span className="text-[#f472b6]">await</span> fetch(
              </span>
              <span className="block">
                {"  "}
                <span className="text-[#22c55e]">{`"${fuelUrl}"`}</span>
                )
              </span>
              <span className="block">
                {"  "}.then((r) <span className="text-[#f472b6]">=&gt;</span>{" "}
                r.json())
              </span>
              <span className="block"></span>
              <span className="block">
                print(
                <span className="text-[#22c55e]">&quot;Lagos PMS price&quot;</span>,
                fuel[<span className="text-[#22c55e]">&quot;data&quot;</span>][
                <span className="text-[#f59e0b]">0</span>][
                <span className="text-[#22c55e]">&quot;pms_price&quot;</span>])
              </span>
            </code>
          </pre>
        </article>
        <article className="grid min-h-[320px] content-start gap-[14px] rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h3 className="text-[clamp(26px,2.2vw,36px)] tracking-[-0.02em]">
            Every data point, traceable.
          </h3>
          <p className="leading-[1.55] text-[var(--color-muted)]">
            The API keeps provenance and freshness first so product teams can
            trust what they ship.
          </p>
          <ul className="m-0 grid gap-1.5 pl-4 text-sm">
            <li>source_url on every record to the original publication</li>
            <li>source_date and last_updated for freshness tracking</li>
            <li>is_confirmed for variable or tentative dates</li>
            <li>Validated staging pipeline before production release</li>
            <li>Pagination and standard filters on list endpoints</li>
          </ul>
        </article>
      </div>
    </section>
  );
}
