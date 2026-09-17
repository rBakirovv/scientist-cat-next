function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDay(date: Date, now: Date) {
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
    ...(date.getFullYear() !== now.getFullYear() && { year: 'numeric' }),
  });
}

/**
 * Метка для списка чатов: сегодняшнее — временем, остальное — датой.
 * 14:14 · 03 сент. · 03 сент. 2025 г.
 */
export function formatListDate(value: Date | string, now = new Date()) {
  const date = new Date(value);

  return isSameDay(date, now) ? formatTime(date) : formatDay(date, now);
}

/**
 * Метка для ленты сообщений: время нужно всегда, дата — когда не сегодня.
 * 14:14 · вчера, 14:14 · 03 сент., 14:14
 */
export function formatMessageDate(value: Date | string, now = new Date()) {
  const date = new Date(value);
  const time = formatTime(date);

  if (isSameDay(date, now)) {
    return time;
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, yesterday)) {
    return `вчера, ${time}`;
  }

  return `${formatDay(date, now)}, ${time}`;
}
