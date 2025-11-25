export function formatDate(
  date: Date | undefined,
  onlyDate: boolean = false
): string | undefined {
  if (onlyDate) {
    return date
      ? date
          .toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
          .replace(',', '/')
      : undefined;
  } else {
    return date
      ? date
          .toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })
          .replace(',', ' às')
      : undefined;
  }
}
