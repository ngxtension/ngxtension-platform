# Linked Query Param design doc

The linkedQueryParam utility function creates a signal that is linked to a query parameter in the URL. This allows you to easily keep your Angular application’s state in sync with the URL, making it easier to share and bookmark specific views.

Key Features:

Two-way binding: Changes to the signal are reflected in the URL, and changes to the URL are reflected in the signal.
Parsing and stringification: You can provide functions to parse the query parameter value when reading it from the URL and stringify it when writing it to the URL.
Built-in parsers: The library provides built-in parsers for common data types, such as numbers and booleans.
Default values: You can provide a default value to be used if the query parameter is not present in the URL.
Coalesced updates: Multiple updates to the signal within the same browser task are coalesced into a single URL update, improving performance.
Supports Navigation Extras: The function supports navigation extras like queryParamsHandling, onSameUrlNavigation, replaceUrl, and skipLocationChange.
Testable: The function is easy to test thanks to its reliance on Angular’s dependency injection system.

---

- inputs

  - key: string | signal<string> | (() => string)
  - options: {
    parse: (value: string) => any
    stringify: (value: any) => string
    defaultValue: any
    source: WritableSignal<any>
    }

- The main source of truth is the query param in the url (router.queryParams).
- When the query param changes, the source signal is updated.
- When the signal changes, the query param is scheduled to be updated (this way we can coalesce the updates).
- When the source signal changes, we coalesce the updates and update the query param.
- When the key changes, we need to schedule a navigation event to update the query param.
- What should we do to the current query param?
- Keep it?
- Remove it?

- When the source signal has an initial value, what wins? The source signal or the query param? - WHich is the source of truth for the default or initial value?

- Test cases to include

Dynamic Key tests

- When the key changes, the previous query param is removed.
- When the key changes, and the user sets a value on the previous query param using another linkedQueryParam, the previous query param is not removed.
- When the key changes, and the new key already has a value, the value that will be used is the one that shows up in the query params, and if the user sets a new value on the new key, the value will be updated in the query params.
- When the key changes, and the new key does not have a value, the default value is used, if there is no default value, the signals current value will be used. If the user needs to set a new value for the new key, the should set it synchronously after setting the linkedQueryParam value (so the update is scheduled on the same tick as the current one).

- Signal input and model tests

  - Make sure the linkedQueryParam works well when we use it with signal inputs
  - Make sure the linkedQueryParam works well when we use it with model inputs
  - Make sure the dynamic value for key works well with model input and signal input
  - We need to make sure when either input or model input changes, the linkedQueryParam value is updated in the query params
  - Signal input should be used with linkedSignal in order for them to work with local data, otherwise a model should be used

- Initial value tests
- When using the source field, the source value will be set to the query param value.
- When using the source field, the source value will be set to the default value if the query param is not present.
- The source value won't be used for initial value or default value, that should always come from the config.
- When the source value changes, the query param will be updated to that value.
