declare module 'astro:content' {
	interface Render {
		'.mdx': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	interface Render {
		'.md': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[]
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[]
	): Promise<CollectionEntry<C>[]>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
				}
			: {
					collection: C;
					id: keyof DataEntryMap[C];
				}
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"docs": {
"404.md": {
	id: "404.md";
  slug: "404";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"es/getting-started/installation.mdx": {
	id: "es/getting-started/installation.mdx";
  slug: "es/getting-started/installation";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/getting-started/introduction.md": {
	id: "es/getting-started/introduction.md";
  slug: "es/getting-started/introduction";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"es/index.mdx": {
	id: "es/index.mdx";
  slug: "es";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/utilities/Assets/svg-sprites.md": {
	id: "es/utilities/Assets/svg-sprites.md";
  slug: "es/utilities/assets/svg-sprites";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"es/utilities/Components/host-binding.md": {
	id: "es/utilities/Components/host-binding.md";
  slug: "es/utilities/components/host-binding";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"es/utilities/Directives/click-outside.md": {
	id: "es/utilities/Directives/click-outside.md";
  slug: "es/utilities/directives/click-outside";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"es/utilities/Directives/repeat.md": {
	id: "es/utilities/Directives/repeat.md";
  slug: "es/utilities/directives/repeat";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"es/utilities/Directives/resize.mdx": {
	id: "es/utilities/Directives/resize.mdx";
  slug: "es/utilities/directives/resize";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/utilities/Directives/trackby-id-prop.md": {
	id: "es/utilities/Directives/trackby-id-prop.md";
  slug: "es/utilities/directives/trackby-id-prop";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"es/utilities/Forms/control-error.md": {
	id: "es/utilities/Forms/control-error.md";
  slug: "es/utilities/forms/control-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"es/utilities/Forms/control-value-accessor.md": {
	id: "es/utilities/Forms/control-value-accessor.md";
  slug: "es/utilities/forms/control-value-accessor";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"es/utilities/Forms/if-validator.md": {
	id: "es/utilities/Forms/if-validator.md";
  slug: "es/utilities/forms/if-validator";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"es/utilities/Gesture/gesture.mdx": {
	id: "es/utilities/Gesture/gesture.mdx";
  slug: "es/utilities/gesture/gesture";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/utilities/Gesture/intro.md": {
	id: "es/utilities/Gesture/intro.md";
  slug: "es/utilities/gesture/intro";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"es/utilities/Injectors/active-element.md": {
	id: "es/utilities/Injectors/active-element.md";
  slug: "es/utilities/injectors/active-element";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"es/utilities/Injectors/assert-injector.md": {
	id: "es/utilities/Injectors/assert-injector.md";
  slug: "es/utilities/injectors/assert-injector";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"es/utilities/Injectors/auto-effect.md": {
	id: "es/utilities/Injectors/auto-effect.md";
  slug: "es/utilities/injectors/auto-effect";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"es/utilities/Injectors/create-injectable.md": {
	id: "es/utilities/Injectors/create-injectable.md";
  slug: "es/utilities/injectors/create-injectable";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"es/utilities/Injectors/create-injection-token.md": {
	id: "es/utilities/Injectors/create-injection-token.md";
  slug: "es/utilities/injectors/create-injection-token";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"es/utilities/Injectors/inject-destroy.md": {
	id: "es/utilities/Injectors/inject-destroy.md";
  slug: "es/utilities/injectors/inject-destroy";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"es/utilities/Injectors/inject-document-visibility.md": {
	id: "es/utilities/Injectors/inject-document-visibility.md";
  slug: "es/utilities/injectors/inject-document-visibility";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"es/utilities/Injectors/inject-is-intersecting.md": {
	id: "es/utilities/Injectors/inject-is-intersecting.md";
  slug: "es/utilities/injectors/inject-is-intersecting";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"es/utilities/Injectors/inject-lazy.md": {
	id: "es/utilities/Injectors/inject-lazy.md";
  slug: "es/utilities/injectors/inject-lazy";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"es/utilities/Injectors/inject-network.md": {
	id: "es/utilities/Injectors/inject-network.md";
  slug: "es/utilities/injectors/inject-network";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"es/utilities/Injectors/inject-params.md": {
	id: "es/utilities/Injectors/inject-params.md";
  slug: "es/utilities/injectors/inject-params";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"es/utilities/Injectors/inject-query-params.md": {
	id: "es/utilities/Injectors/inject-query-params.md";
  slug: "es/utilities/injectors/inject-query-params";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"es/utilities/Injectors/inject-route-data.md": {
	id: "es/utilities/Injectors/inject-route-data.md";
  slug: "es/utilities/injectors/inject-route-data";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"es/utilities/Injectors/inject-route-fragment.md": {
	id: "es/utilities/Injectors/inject-route-fragment.md";
  slug: "es/utilities/injectors/inject-route-fragment";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"es/utilities/Injectors/navigation-end.md": {
	id: "es/utilities/Injectors/navigation-end.md";
  slug: "es/utilities/injectors/navigation-end";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"es/utilities/Intl/intl.md": {
	id: "es/utilities/Intl/intl.md";
  slug: "es/utilities/intl/intl";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"es/utilities/Migrations/inject-migration.md": {
	id: "es/utilities/Migrations/inject-migration.md";
  slug: "es/utilities/migrations/inject-migration";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"es/utilities/Miscellaneous/singleton-proxy.md": {
	id: "es/utilities/Miscellaneous/singleton-proxy.md";
  slug: "es/utilities/miscellaneous/singleton-proxy";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"es/utilities/Operators/debug.md": {
	id: "es/utilities/Operators/debug.md";
  slug: "es/utilities/operators/debug";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"es/utilities/Operators/filter-array.md": {
	id: "es/utilities/Operators/filter-array.md";
  slug: "es/utilities/operators/filter-array";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"es/utilities/Operators/filter-nil.md": {
	id: "es/utilities/Operators/filter-nil.md";
  slug: "es/utilities/operators/filter-nil";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"es/utilities/Operators/map-array.md": {
	id: "es/utilities/Operators/map-array.md";
  slug: "es/utilities/operators/map-array";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"es/utilities/Operators/map-skip-undefined.md": {
	id: "es/utilities/Operators/map-skip-undefined.md";
  slug: "es/utilities/operators/map-skip-undefined";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"es/utilities/Operators/reduce-array.md": {
	id: "es/utilities/Operators/reduce-array.md";
  slug: "es/utilities/operators/reduce-array";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"es/utilities/Operators/rx-effect.md": {
	id: "es/utilities/Operators/rx-effect.md";
  slug: "es/utilities/operators/rx-effect";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"es/utilities/Signals/computed-async.md": {
	id: "es/utilities/Signals/computed-async.md";
  slug: "es/utilities/signals/computed-async";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"es/utilities/Signals/computed-from.md": {
	id: "es/utilities/Signals/computed-from.md";
  slug: "es/utilities/signals/computed-from";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"es/utilities/Signals/computed-previous.md": {
	id: "es/utilities/Signals/computed-previous.md";
  slug: "es/utilities/signals/computed-previous";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"getting-started/installation.mdx": {
	id: "getting-started/installation.mdx";
  slug: "getting-started/installation";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"getting-started/introduction.md": {
	id: "getting-started/introduction.md";
  slug: "getting-started/introduction";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"index.mdx": {
	id: "index.mdx";
  slug: "index";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"logos/logos.md": {
	id: "logos/logos.md";
  slug: "logos/logos";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Assets/svg-sprites.md": {
	id: "utilities/Assets/svg-sprites.md";
  slug: "utilities/assets/svg-sprites";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Components/host-binding.md": {
	id: "utilities/Components/host-binding.md";
  slug: "utilities/components/host-binding";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Directives/click-outside.md": {
	id: "utilities/Directives/click-outside.md";
  slug: "utilities/directives/click-outside";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Directives/merge-inputs.md": {
	id: "utilities/Directives/merge-inputs.md";
  slug: "utilities/directives/merge-inputs";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Directives/repeat.mdx": {
	id: "utilities/Directives/repeat.mdx";
  slug: "utilities/directives/repeat";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"utilities/Directives/resize.mdx": {
	id: "utilities/Directives/resize.mdx";
  slug: "utilities/directives/resize";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"utilities/Directives/trackby-id-prop.md": {
	id: "utilities/Directives/trackby-id-prop.md";
  slug: "utilities/directives/trackby-id-prop";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Forms/control-error.md": {
	id: "utilities/Forms/control-error.md";
  slug: "utilities/forms/control-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Forms/control-value-accessor.md": {
	id: "utilities/Forms/control-value-accessor.md";
  slug: "utilities/forms/control-value-accessor";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Forms/form-events.md": {
	id: "utilities/Forms/form-events.md";
  slug: "utilities/forms/form-events";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Forms/if-validator.md": {
	id: "utilities/Forms/if-validator.md";
  slug: "utilities/forms/if-validator";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Forms/not-pattern.md": {
	id: "utilities/Forms/not-pattern.md";
  slug: "utilities/forms/not-pattern";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Gesture/gesture.mdx": {
	id: "utilities/Gesture/gesture.mdx";
  slug: "utilities/gesture/gesture";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"utilities/Gesture/intro.md": {
	id: "utilities/Gesture/intro.md";
  slug: "utilities/gesture/intro";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Http/merge-http-context.md": {
	id: "utilities/Http/merge-http-context.md";
  slug: "utilities/http/merge-http-context";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Injectors/active-element.md": {
	id: "utilities/Injectors/active-element.md";
  slug: "utilities/injectors/active-element";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Injectors/assert-injector.md": {
	id: "utilities/Injectors/assert-injector.md";
  slug: "utilities/injectors/assert-injector";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Injectors/auto-effect.md": {
	id: "utilities/Injectors/auto-effect.md";
  slug: "utilities/injectors/auto-effect";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Injectors/create-injectable.md": {
	id: "utilities/Injectors/create-injectable.md";
  slug: "utilities/injectors/create-injectable";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Injectors/create-injection-token.md": {
	id: "utilities/Injectors/create-injection-token.md";
  slug: "utilities/injectors/create-injection-token";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Injectors/inject-destroy.md": {
	id: "utilities/Injectors/inject-destroy.md";
  slug: "utilities/injectors/inject-destroy";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Injectors/inject-document-visibility.md": {
	id: "utilities/Injectors/inject-document-visibility.md";
  slug: "utilities/injectors/inject-document-visibility";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Injectors/inject-inputs.md": {
	id: "utilities/Injectors/inject-inputs.md";
  slug: "utilities/injectors/inject-inputs";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Injectors/inject-is-intersecting.md": {
	id: "utilities/Injectors/inject-is-intersecting.md";
  slug: "utilities/injectors/inject-is-intersecting";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Injectors/inject-lazy.md": {
	id: "utilities/Injectors/inject-lazy.md";
  slug: "utilities/injectors/inject-lazy";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Injectors/inject-local-storage.md": {
	id: "utilities/Injectors/inject-local-storage.md";
  slug: "utilities/injectors/inject-local-storage";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Injectors/inject-network.md": {
	id: "utilities/Injectors/inject-network.md";
  slug: "utilities/injectors/inject-network";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Injectors/inject-params.md": {
	id: "utilities/Injectors/inject-params.md";
  slug: "utilities/injectors/inject-params";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Injectors/inject-query-params.md": {
	id: "utilities/Injectors/inject-query-params.md";
  slug: "utilities/injectors/inject-query-params";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Injectors/inject-route-data.md": {
	id: "utilities/Injectors/inject-route-data.md";
  slug: "utilities/injectors/inject-route-data";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Injectors/inject-route-fragment.md": {
	id: "utilities/Injectors/inject-route-fragment.md";
  slug: "utilities/injectors/inject-route-fragment";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Injectors/inject-text-selection.md": {
	id: "utilities/Injectors/inject-text-selection.md";
  slug: "utilities/injectors/inject-text-selection";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Injectors/linked-query-param.md": {
	id: "utilities/Injectors/linked-query-param.md";
  slug: "utilities/injectors/linked-query-param";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Injectors/navigation-end.md": {
	id: "utilities/Injectors/navigation-end.md";
  slug: "utilities/injectors/navigation-end";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Injectors/signal-history.md": {
	id: "utilities/Injectors/signal-history.md";
  slug: "utilities/injectors/signal-history";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Intl/intl.md": {
	id: "utilities/Intl/intl.md";
  slug: "utilities/intl/intl";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Migrations/host-binding-migration.md": {
	id: "utilities/Migrations/host-binding-migration.md";
  slug: "utilities/migrations/host-binding-migration";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Migrations/inject-migration.md": {
	id: "utilities/Migrations/inject-migration.md";
  slug: "utilities/migrations/inject-migration";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Migrations/new-outputs-migration.md": {
	id: "utilities/Migrations/new-outputs-migration.md";
  slug: "utilities/migrations/new-outputs-migration";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Migrations/queries-migration.md": {
	id: "utilities/Migrations/queries-migration.md";
  slug: "utilities/migrations/queries-migration";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Migrations/self-closing-tags.md": {
	id: "utilities/Migrations/self-closing-tags.md";
  slug: "utilities/migrations/self-closing-tags";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Migrations/sfc-migration.md": {
	id: "utilities/Migrations/sfc-migration.md";
  slug: "utilities/migrations/sfc-migration";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Migrations/signal-inputs-migration.md": {
	id: "utilities/Migrations/signal-inputs-migration.md";
  slug: "utilities/migrations/signal-inputs-migration";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Miscellaneous/singleton-proxy.md": {
	id: "utilities/Miscellaneous/singleton-proxy.md";
  slug: "utilities/miscellaneous/singleton-proxy";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Operators/create-repeat.md": {
	id: "utilities/Operators/create-repeat.md";
  slug: "utilities/operators/create-repeat";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Operators/debug.md": {
	id: "utilities/Operators/debug.md";
  slug: "utilities/operators/debug";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Operators/derive-loading.md": {
	id: "utilities/Operators/derive-loading.md";
  slug: "utilities/operators/derive-loading";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Operators/filter-array.md": {
	id: "utilities/Operators/filter-array.md";
  slug: "utilities/operators/filter-array";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Operators/filter-nil.md": {
	id: "utilities/Operators/filter-nil.md";
  slug: "utilities/operators/filter-nil";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Operators/map-array.md": {
	id: "utilities/Operators/map-array.md";
  slug: "utilities/operators/map-array";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Operators/map-skip-undefined.md": {
	id: "utilities/Operators/map-skip-undefined.md";
  slug: "utilities/operators/map-skip-undefined";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Operators/poll.md": {
	id: "utilities/Operators/poll.md";
  slug: "utilities/operators/poll";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Operators/reduce-array.md": {
	id: "utilities/Operators/reduce-array.md";
  slug: "utilities/operators/reduce-array";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Operators/rx-effect.md": {
	id: "utilities/Operators/rx-effect.md";
  slug: "utilities/operators/rx-effect";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Operators/take-latest-from.md": {
	id: "utilities/Operators/take-latest-from.md";
  slug: "utilities/operators/take-latest-from";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Operators/when-document-visible.md": {
	id: "utilities/Operators/when-document-visible.md";
  slug: "utilities/operators/when-document-visible";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Pipes/call-apply.md": {
	id: "utilities/Pipes/call-apply.md";
  slug: "utilities/pipes/call-apply";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Pipes/repeat.mdx": {
	id: "utilities/Pipes/repeat.mdx";
  slug: "utilities/pipes/repeat";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"utilities/Signals/computed-async.md": {
	id: "utilities/Signals/computed-async.md";
  slug: "utilities/signals/computed-async";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Signals/computed-from.md": {
	id: "utilities/Signals/computed-from.md";
  slug: "utilities/signals/computed-from";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Signals/computed-previous.md": {
	id: "utilities/Signals/computed-previous.md";
  slug: "utilities/signals/computed-previous";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Signals/computed.md": {
	id: "utilities/Signals/computed.md";
  slug: "utilities/signals/computed";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Signals/connect.md": {
	id: "utilities/Signals/connect.md";
  slug: "utilities/signals/connect";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Signals/create-notifier.md": {
	id: "utilities/Signals/create-notifier.md";
  slug: "utilities/signals/create-notifier";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Signals/create-signal.md": {
	id: "utilities/Signals/create-signal.md";
  slug: "utilities/signals/create-signal";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Signals/derived-async.md": {
	id: "utilities/Signals/derived-async.md";
  slug: "utilities/signals/derived-async";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Signals/derived-from.md": {
	id: "utilities/Signals/derived-from.md";
  slug: "utilities/signals/derived-from";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Signals/effect-once-if.md": {
	id: "utilities/Signals/effect-once-if.md";
  slug: "utilities/signals/effect-once-if";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Signals/explicit-effect.md": {
	id: "utilities/Signals/explicit-effect.md";
  slug: "utilities/signals/explicit-effect";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Signals/merge-from.md": {
	id: "utilities/Signals/merge-from.md";
  slug: "utilities/signals/merge-from";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Signals/signal-slice.md": {
	id: "utilities/Signals/signal-slice.md";
  slug: "utilities/signals/signal-slice";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Signals/to-lazy-signal.md": {
	id: "utilities/Signals/to-lazy-signal.md";
  slug: "utilities/signals/to-lazy-signal";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Signals/to-observable-signal.md": {
	id: "utilities/Signals/to-observable-signal.md";
  slug: "utilities/signals/to-observable-signal";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"utilities/Stores/create-effect.md": {
	id: "utilities/Stores/create-effect.md";
  slug: "utilities/stores/create-effect";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		"contributors": {
"chau-tran": {
	id: "chau-tran";
  collection: "contributors";
  data: InferEntrySchema<"contributors">
};
"dafnik": {
	id: "dafnik";
  collection: "contributors";
  data: InferEntrySchema<"contributors">
};
"dale-nguyen": {
	id: "dale-nguyen";
  collection: "contributors";
  data: InferEntrySchema<"contributors">
};
"daniele-morosinotto": {
	id: "daniele-morosinotto";
  collection: "contributors";
  data: InferEntrySchema<"contributors">
};
"enea-jahollari": {
	id: "enea-jahollari";
  collection: "contributors";
  data: InferEntrySchema<"contributors">
};
"evgeniy-oz": {
	id: "evgeniy-oz";
  collection: "contributors";
  data: InferEntrySchema<"contributors">
};
"fabiendehopre": {
	id: "fabiendehopre";
  collection: "contributors";
  data: InferEntrySchema<"contributors">
};
"fiorelozere": {
	id: "fiorelozere";
  collection: "contributors";
  data: InferEntrySchema<"contributors">
};
"ion-prodan": {
	id: "ion-prodan";
  collection: "contributors";
  data: InferEntrySchema<"contributors">
};
"jeanmeche": {
	id: "jeanmeche";
  collection: "contributors";
  data: InferEntrySchema<"contributors">
};
"josh-morony": {
	id: "josh-morony";
  collection: "contributors";
  data: InferEntrySchema<"contributors">
};
"kevinkreuzer": {
	id: "kevinkreuzer";
  collection: "contributors";
  data: InferEntrySchema<"contributors">
};
"krzysztof-kachniarz": {
	id: "krzysztof-kachniarz";
  collection: "contributors";
  data: InferEntrySchema<"contributors">
};
"lilbeqiri": {
	id: "lilbeqiri";
  collection: "contributors";
  data: InferEntrySchema<"contributors">
};
"lorenzo-dianni": {
	id: "lorenzo-dianni";
  collection: "contributors";
  data: InferEntrySchema<"contributors">
};
"lucas-garcia": {
	id: "lucas-garcia";
  collection: "contributors";
  data: InferEntrySchema<"contributors">
};
"mateusz-stefanczyk": {
	id: "mateusz-stefanczyk";
  collection: "contributors";
  data: InferEntrySchema<"contributors">
};
"michael-berger": {
	id: "michael-berger";
  collection: "contributors";
  data: InferEntrySchema<"contributors">
};
"nevzat-topçu": {
	id: "nevzat-topçu";
  collection: "contributors";
  data: InferEntrySchema<"contributors">
};
"pawel-ostromecki": {
	id: "pawel-ostromecki";
  collection: "contributors";
  data: InferEntrySchema<"contributors">
};
"robby-rabbitman": {
	id: "robby-rabbitman";
  collection: "contributors";
  data: InferEntrySchema<"contributors">
};
"sergi-dote": {
	id: "sergi-dote";
  collection: "contributors";
  data: InferEntrySchema<"contributors">
};
"thomas-laforge": {
	id: "thomas-laforge";
  collection: "contributors";
  data: InferEntrySchema<"contributors">
};
"tomer": {
	id: "tomer";
  collection: "contributors";
  data: InferEntrySchema<"contributors">
};
};
"i18n": {
"en": {
	id: "en";
  collection: "i18n";
  data: InferEntrySchema<"i18n">
};
};

	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	export type ContentConfig = typeof import("../src/content/config.js");
}
