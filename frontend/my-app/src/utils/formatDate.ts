/**
 * Options for date formatting
 */
export interface DateFormatOptions {
    /**
     * If true, shows only date without time
     * @default false
     */
    dateOnly?: boolean;

    /**
     * Locale for date formatting
     * @default 'ru-RU'
     */
    locale?: string;

    /**
     * Date format (additional options can be added here)
     * @default 'long'
     */
    format?: 'short' | 'long';
}

/**
 * Format date to localized string with optional time
 * Default: "31 января 2026 г., 14:30"
 *
 * @example
 * formatDate(new Date())
 * // "31 января 2026 г., 14:30"
 *
 * @example
 * formatDate(new Date(), { dateOnly: true })
 * // "31 января 2026 г."
 *
 * @param date - Date object or ISO string to format
 * @param options - Formatting options
 * @returns Formatted date string
 */
export function formatDate(
    date: Date | string,
    options: DateFormatOptions = {}
): string {
    const { dateOnly = false, locale = 'ru-RU', format = 'long' } = options;

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
        return 'Некорректная дата';
    }

    const dateFormatter = new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: format === 'long' ? 'long' : 'numeric',
        year: 'numeric'
    });

    const formattedDate = dateFormatter.format(dateObj);

    if (dateOnly) {
        return formattedDate;
    }

    const timeFormatter = new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit'
    });

    const formattedTime = timeFormatter.format(dateObj);

    return `${formattedDate}, ${formattedTime}`;
}
