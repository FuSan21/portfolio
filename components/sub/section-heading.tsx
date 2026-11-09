type SectionHeadingProps = {
  title: string;
  /** A true fact about the section's contents, e.g. a count. */
  detail?: string;
};

export const SectionHeading = ({ title, detail }: SectionHeadingProps) => (
  <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-form/25 pb-4">
    <h2 className="font-display text-5xl text-form md:text-6xl">{title}</h2>
    {detail && <p className="mono-label text-form/55">{detail}</p>}
  </div>
);
