---
'neverthrow': major
---

Allow orElse method to change ok types.
This makes the orElse types match the implementation.

This is a breaking change for the orElse type argument list,
as the ok type must now be provided before the err type.

```diff
- result.orElse<ErrType>(foo)
+ result.orElse<OkType, ErrType>(foo)
```

This only applies if type arguments were
explicitly provided at an orElse callsite.
If the type arguments were inferred,
no updates are needed during the upgrade.
