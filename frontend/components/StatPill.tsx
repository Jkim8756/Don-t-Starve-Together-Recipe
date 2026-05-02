import Image from "next/image";

interface StatPillProps {
  icon: string;
  value: number;
  label: string;
  color: string;
}

export default function StatPill({ icon, value, label, color }: StatPillProps) {
  const formatted =
    value >= 0 ? `+${value.toFixed(1)}` : value.toFixed(1);

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${color} bg-black/30`}
      title={`${label}: ${formatted}`}
    >
      <Image
        src={icon}
        alt={label}
        width={14}
        height={14}
        className="shrink-0"
      />
      <span>{formatted}</span>
    </span>
  );
}
