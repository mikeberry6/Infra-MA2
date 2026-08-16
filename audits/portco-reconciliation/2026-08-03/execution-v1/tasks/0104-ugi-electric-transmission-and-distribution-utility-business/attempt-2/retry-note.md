# Task 104 retry note

The first protected production dry-run made no writes and stopped because
`CREATE_COMPANY` already incorporates its required pending ownership
transaction, so separately declaring `ADD_PENDING_TRANSACTION` did not match
the fail-closed mutation plan. Attempt 2 preserves the identical researched
company after-image and pending Argo transaction while declaring only
`CREATE_COMPANY`.
