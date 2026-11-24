/**
 * Before → After pairs for the homepage.
 *
 * Every "after" uses the API exactly as its doc page shows it (re-broken to stay within ~49 columns so
 * phones never scroll sideways); every "before" is the plain-Angular version the doc page describes:
 *  - linkedQueryParam: utilities/Router/linked-query-param.md
 *    ("Instead of manually reading from ActivatedRoute.queryParams and manually updating the router")
 *  - onEvent: utilities/DOM-Events/on-event.md
 *    (it "uses an AbortController and passes its signal to addEventListener", cleaned up "via DestroyRef.onDestroy")
 *  - injectLocalStorage: utilities/Browser-APIs/inject-local-storage.md
 *    (Usage: `theme = injectLocalStorage<'light' | 'dark'>('theme', { defaultValue: 'light' })`; values go through
 *    JSON.stringify / JSON.parse; `storageSync` is on by default, so it follows the `storage` event of other tabs)
 *
 * Imports are left out of both sides, so the line counts compare like with like.
 * Line prefixes: "  " kept in both, "- " only before, "+ " only after.
 */

export type LineKind = 'keep' | 'del' | 'add';

export interface Pair {
	id: string;
	utility: string;
	href: string;
	file: string;
	/** Raw diff: each line starts with "  ", "- " or "+ " */
	diff: string;
}

export const pairs: Pair[] = [
	{
		id: 'linked-query-param',
		utility: 'linkedQueryParam',
		href: '/utilities/router/linked-query-param/',
		file: 'search-page.ts',
		diff: `  export class SearchPage {
-   private route = inject(ActivatedRoute);
-   private router = inject(Router);
-
-   search = toSignal(
-     this.route.queryParamMap.pipe(
-       map((params) => params.get('search')),
-     ),
-   );
-
-   setSearch(search: string) {
-     this.router.navigate([], {
-       relativeTo: this.route,
-       queryParams: { search },
-       queryParamsHandling: 'merge',
-     });
-   }
+   search = linkedQueryParam('search');
  }`,
	},
	{
		id: 'on-event',
		utility: 'onEvent',
		href: '/utilities/dom-events/on-event/',
		file: 'layout.ts',
		diff: `  constructor() {
-   const controller = new AbortController();
-   inject(DestroyRef).onDestroy(() =>
-     controller.abort(),
-   );
-
-   window.addEventListener(
-     'resize',
-     (event) => {
-       console.log('Window resized', event);
-     },
-     { signal: controller.signal },
-   );
+   onEvent(window, 'resize', (event) => {
+     console.log('Window resized', event);
+   });
  }`,
	},
	{
		id: 'inject-local-storage',
		utility: 'injectLocalStorage',
		href: '/utilities/browser-apis/inject-local-storage/',
		file: 'theme-toggle.ts',
		diff: `  export class ThemeToggle {
-   readonly theme = signal<'light' | 'dark'>(
-     JSON.parse(
-       localStorage.getItem('theme') ?? '"light"',
-     ),
-   );
-
-   constructor() {
-     effect(() => {
-       localStorage.setItem(
-         'theme',
-         JSON.stringify(this.theme()),
-       );
-     });
-
-     fromEvent<StorageEvent>(window, 'storage')
-       .pipe(takeUntilDestroyed())
-       .subscribe((e) => {
-         if (e.key === 'theme' && e.newValue) {
-           this.theme.set(JSON.parse(e.newValue));
-         }
-       });
-   }
+   readonly theme = injectLocalStorage<
+     'light' | 'dark'
+   >('theme', {
+     defaultValue: 'light',
+   });
  }`,
	},
];

export interface ParsedLine {
	kind: LineKind;
	text: string;
	/** Row in the before view (keep + del), after view (keep + add) and diff view (all) */
	b: number;
	a: number;
	d: number;
	/** Order among lines of the same kind, for staggering */
	o: number;
}

export interface ParsedPair extends Pair {
	code: string;
	lines: ParsedLine[];
	/** Non-blank lines in each state, counted from the code itself */
	beforeLines: number;
	afterLines: number;
	totalLines: number;
	beforeRows: number;
	afterRows: number;
	/** Longest line, in characters */
	cols: number;
}

export function parsePair(p: Pair): ParsedPair {
	let b = 0;
	let a = 0;
	let dels = 0;
	let adds = 0;
	const lines: ParsedLine[] = p.diff.split('\n').map((raw, d) => {
		const kind: LineKind =
			raw[0] === '-' ? 'del' : raw[0] === '+' ? 'add' : 'keep';
		const text = raw.slice(2);
		const line: ParsedLine = {
			kind,
			text,
			d,
			b: kind === 'add' ? a : b,
			a: kind === 'del' ? b : a,
			o: kind === 'add' ? adds++ : kind === 'del' ? dels++ : 0,
		};
		if (kind !== 'add') b++;
		if (kind !== 'del') a++;
		return line;
	});
	// Lines that only exist in one state still need a resting row in the other: put them where they would sit.
	let bi = 0;
	let ai = 0;
	for (const l of lines) {
		if (l.kind === 'keep') {
			bi = l.b + 1;
			ai = l.a + 1;
		} else if (l.kind === 'del') {
			l.a = ai;
			bi = l.b + 1;
		} else {
			l.b = bi;
			ai = l.a + 1;
		}
	}
	const nonBlank = (k: LineKind[]) =>
		lines.filter((r) => k.includes(r.kind) && r.text.trim()).length;
	return {
		...p,
		code: lines.map((r) => r.text).join('\n'),
		lines,
		beforeLines: nonBlank(['keep', 'del']),
		afterLines: nonBlank(['keep', 'add']),
		totalLines: lines.length,
		beforeRows: b,
		afterRows: a,
		cols: Math.max(...lines.map((l) => l.text.length)),
	};
}
