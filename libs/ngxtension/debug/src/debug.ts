import { tap } from 'rxjs/operators';

//INSPIRED BY @netbasal ARTICLE https://netbasal.com/creating-custom-operators-in-rxjs-32f052d69457
export function debug<T>(tag: string) {
	return tap<T>({
		next(value) {
			console.log(new Date().toISOString(), `[${tag}: Next]`, value);
		},
		error(err) {
			console.error(new Date().toISOString(), `[${tag}: Error]`, err);
		},
		complete() {
			console.warn(new Date().toISOString(), `[${tag}: Completed]`);
		},
	});
}
