---
'neverthrow': minor
---

change the return type of `safeTry` to be `ResultAsync<T, E>` instead of `Promise<Result<T, E>>` for better composability
