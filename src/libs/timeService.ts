import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";
import localeData from "dayjs/plugin/localeData";
import relativeTime from "dayjs/plugin/relativeTime";

// Extend Day.js with required plugins
dayjs.extend(utc);
dayjs.extend(customParseFormat);
dayjs.extend(localeData);
dayjs.extend(relativeTime);

const timeService = {
    getNow: (): string => {
        return dayjs().format("YYYY-MM-DD HH:mm:ss");
    },

    getMoment: (date: string | Date | dayjs.Dayjs): dayjs.Dayjs => {
        return dayjs(date);
    },

    getStrDateParseFromUTC: (
        date: string | Date,
        format: string = "YYYY-MM-DD HH:mm:ss"
    ): string => {
        if (!date) return "";

        // Parse the date as UTC
        const momentUTC = dayjs.utc(date);

        // Convert to local timezone
        const localTime = momentUTC.local();

        return localTime.format(format);
    },

    getDateParseFromUTC: (date: string | Date): Date | "" => {
        if (!date) return "";

        // Parse the date as UTC
        const momentUTC = dayjs.utc(date);

        // Convert to local timezone
        const localTime = momentUTC.local();

        // Format as string and convert to Date
        const strDate = localTime.format("YYYY-MM-DD HH:mm:ss");
        return new Date(strDate);
    },

    getStrDateParseToUTC: (
        date: string | Date | dayjs.Dayjs,
        format: string = "YYYY-MM-DD HH:mm:ss"
    ): string => {
        // Parse the local date
        const localTime = dayjs(date);

        // Convert to UTC
        const utcTime = localTime.utc();

        return utcTime.format(format);
    },

    getMonthStartEndDates: (
        date: string | Date | dayjs.Dayjs
    ): { startDate: string; endDate: string } => {
        const startDate = dayjs(date).startOf("month").format("YYYY-MM-DD");
        const endDate = dayjs(date).endOf("month").format("YYYY-MM-DD");
        return { startDate, endDate };
    },

    getYearStartEndDates: (
        date: string | Date | dayjs.Dayjs
    ): { startDate: string; endDate: string } => {
        const startDate = dayjs(date).startOf("year").format("YYYY-MM-DD");
        const endDate = dayjs(date).endOf("year").format("YYYY-MM-DD");
        return { startDate, endDate };
    },

    formatDate: (date: string | Date | dayjs.Dayjs, format: string): string => {
        return dayjs(date).format(format);
    },

    getMonthLabels: (locale: string = "en"): string[] => {
        // Set Day.js locale
        dayjs.locale(locale);

        // Get month names using localeData
        return dayjs.months();
    },

    dateConversion: function (date: string | dayjs.Dayjs | Date) {
        if (!date) return "";

        const dayjsDate = dayjs(date);
        if (!dayjsDate.isValid()) return "";

        return dayjsDate.utc().format("YYYY-MM-DD HH:mm:ss");
    },

    formatTimeAgo: function (date: string | Date) {
        const now = dayjs();
        const target = dayjs(date);
        const diffDays = now.diff(target, "day");

        if (diffDays > 14) {
            return target.format("DD/MM/YY");
        }
        return target.fromNow();
    },
};

export default timeService;
