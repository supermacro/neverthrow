---
'neverthrow': patch
---

Close the `safeTry` generator on `Err` short-circuit so `finally` blocks run
