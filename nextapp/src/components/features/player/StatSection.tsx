const EntryCircle = () => {
  return (
    <div className="flex-col flex rounded-full w-48 h-48 items-center border-[1px] justify-center">
      <h1 className="text-[40px]">54.2%</h1>
      <p>entry sucess</p>
      <div className="flex flex-row">
        <p>142 | 108</p>
      </div>
    </div>
  );
};

const SmallCard = ({ title, value }: { title: string; value: number }) => {
  return (
    <div className="w-40">
      <p>{title}</p>
      <div className="flex flex-row">
        <div></div>
        <p>{value}</p>
      </div>
    </div>
  );
};

type CardProps = {
  title: string;
  value: number;
};

type BigCardProps = {
  title: string;
  value: number;
  top: number;
  specific: CardProps[];
};

const BigCard = (data: BigCardProps) => {
  return (
    <div className="w-40">
      <div className="flex flex-row">
        <p>{data.title}</p>
        <div>
          <p>{data.value}</p>
          <p>top</p>
        </div>
      </div>
      <div>line</div>
      {data.specific?.map((s) => (
        <div
          key={"-1" + s.title}
          className="flex flex-row w-full justify-between"
        >
          <p>{s.title}</p>
          <p>{s.value}</p>
        </div>
      ))}
    </div>
  );
};

export default async function StatsSectionComponent({
  stats,
  moreStats,
}: {
  stats: CardProps[];
  moreStats: BigCardProps[];
}) {
  return (
    <div className="w-full flex flex-col items-center mx-auto">
      <EntryCircle />
      <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 w-full">
        {stats.map((d, index) => (
          <SmallCard key={d.title + index} title={d.title} value={d.value} />
        ))}
      </div>
      <div className="grid lg:grid-cols-4 g w-full sm:grid-cols-2">
        {moreStats.map((d, index) => (
          <BigCard
            key={d.title}
            title={d.title}
            value={d.value}
            top={d.top}
            specific={d.specific}
          />
        ))}
      </div>
    </div>
  );
}
