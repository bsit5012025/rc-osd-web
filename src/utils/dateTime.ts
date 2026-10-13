const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export function formatDateTime(value: string | null | undefined): string {
    if (!value) return "—";

    if (DATE_ONLY.test(value)) {
        return formatDate(new Date(`${value}T00:00:00`));
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) return value;

    const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0 || date.getSeconds() !== 0;
    if (!hasTime) return formatDate(date);

    const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    return `${formatDate(date)} · ${time}`;
}

export function dateKey(value: string | null | undefined): string {
    return value ? value.slice(0, 10) : "";
}

function formatDate(date: Date): string {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
