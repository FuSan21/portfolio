import { EXPERIENCES } from "@/constants";
import { parseStringWithBold } from "@/lib/utils";
import { SectionHeading } from "@/components/sub/section-heading";

type LedgerRecord = (typeof EXPERIENCES)[keyof typeof EXPERIENCES][number];

// One fixed-width ledger row per role; <details> handles open/close natively,
// so this stays a server component.
const LedgerRow = ({
  record,
  open,
}: {
  record: LedgerRecord;
  open?: boolean;
}) => (
  <details open={open} className="group border-t last:border-b">
    <summary className="grid cursor-pointer grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 px-2 py-5 transition-colors hover:bg-ledger md:grid-cols-[11rem_1fr_minmax(0,18rem)_auto]">
      <span className="mono-label text-form/55 md:col-start-1 md:row-start-1">
        {record.date}
      </span>
      <span className="col-start-1 font-display text-2xl text-form md:col-start-2 md:row-start-1 md:text-3xl">
        {record.title}
      </span>
      <span className="mono-label col-start-1 text-form/70 md:col-start-3 md:row-start-1">
        {record.name}
      </span>
      <span
        aria-hidden
        className="mono-label col-start-2 row-start-1 text-copy md:col-start-4"
      >
        <span className="group-open:hidden">[+]</span>
        <span className="hidden group-open:inline">[−]</span>
      </span>
    </summary>
    <ul className="space-y-3 px-2 pb-8 md:ml-[calc(11rem+1.5rem)] md:max-w-3xl">
      {record.points.map((point, i) => (
        <li key={i} className="text-form/80 leading-relaxed">
          {parseStringWithBold(point)}
        </li>
      ))}
    </ul>
  </details>
);

export const Experience = () => (
  <section
    id="experiences"
    className="mx-auto max-w-6xl scroll-mt-20 px-6 py-28 md:px-10"
  >
    <SectionHeading
      title="Experience"
      detail={`${EXPERIENCES.job.length} roles · ${EXPERIENCES.education.length} degree`}
    />
    <div className="mt-12">
      {EXPERIENCES.job.map((record, i) => (
        <LedgerRow
          key={`${record.name}-${record.title}`}
          record={record}
          open={i === 0}
        />
      ))}
    </div>

    <h3 className="mono-label mt-16 text-form/60">Education</h3>
    <div className="mt-4">
      {EXPERIENCES.education.map((record) => (
        <LedgerRow key={record.title} record={record} />
      ))}
    </div>
  </section>
);
