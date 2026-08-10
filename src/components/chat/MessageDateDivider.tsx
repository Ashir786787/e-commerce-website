interface MessageDateDividerProps {
  timestamp: number;
}

function formatDate(timestamp: number) {
  const date = new Date(timestamp);
  const today = new Date();

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  if (isSameDay(date, today)) {
    return "Today";
  }

  if (isSameDay(date, yesterday)) {
    return "Yesterday";
  }

  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function MessageDateDivider({ timestamp }: MessageDateDividerProps) {
  return (
    <div className="flex items-center justify-center py-1">
      <span className="rounded-full bg-neutral-200/70 px-3 py-1 text-[11px] font-medium text-neutral-500">
        {formatDate(timestamp)}
      </span>
    </div>
  );
}
