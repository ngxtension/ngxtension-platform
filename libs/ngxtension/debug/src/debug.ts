import { tap } from 'rxjs/operators';

export type ExtraNotifications = {
	subscribe?: boolean;
	unsubscribe?: boolean;
	finalize?: boolean;
};

//INSPIRED BY @netbasal ARTICLE https://netbasal.com/creating-custom-operators-in-rxjs-32f052d69457
export function debug<T>(tag: string, extraNotifications?: ExtraNotifications) {
	const formatNotif = (notif: string, data?: unknown) => [
		new Date().toISOString(),
		`[${tag}: ${notif}]`,
		data,
	];
	return tap<T>({
		next: (value) => console.log(...formatNotif('Next', value)),
		error: (err) => console.error(...formatNotif('Error', err)),
		complete: () => console.warn(...formatNotif('Completed')),
		subscribe: () =>
			extraNotifications?.subscribe &&
			console.info(...formatNotif('Subscribed')),
		unsubscribe: () =>
			extraNotifications?.unsubscribe &&
			console.info(...formatNotif(`Unsubscribed`)),
		finalize: () =>
			extraNotifications?.finalize && console.info(...formatNotif(`Finalized`)),
	});
}
