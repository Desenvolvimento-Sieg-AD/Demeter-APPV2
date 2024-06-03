import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

export const formatDate = (dateString: string | null) => {
	dayjs.extend(utc);
	dayjs.extend(timezone);

	const date = dayjs(dateString).tz('America/Bahia');
	return date.format('DD/MM/YYYY');
};

export const formatDateTime = (dateString: string | null, format = 'DD/MM/YYYY HH:mm') => {
	dayjs.extend(utc);
	dayjs.extend(timezone);

	const date = dayjs(dateString).tz('America/Bahia');
	return date.format(format);
};
