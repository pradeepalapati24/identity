# Security Specification - CoreLens Threads

## Data Invariants
1. A product must have a non-empty name (max 100 chars).
2. A product must have a positive numeric price.
3. A product must have an image URL from a valid domain.
4. Document IDs must follow standard alphanumeric format.

## Dirty Dozen Payloads
1. **The Ghost Field**: Creating a product with an `isFeatured` boolean not in schema.
2. **The Price Underflow**: Product with `price: -100`.
3. **The Name Overflow**: Product with a name longer than 1000 characters.
4. **The Identity Spoof**: Updating a product's name but trying to change `createdAt`.
5. **The ID Poisoning**: Trying to create a document with ID `../../secrets`.
6. **The Type Confusion**: Setting `price` as a string `"49.99"`.
7. **The Null Attack**: Creating a product with `imageUrl: null`.
8. **The Storage Bypass**: Providing a non-Firebase storage URL.
9. **The Unverified Admin**: Updating a product without being in the admin list (if implemented).
10. **The Bulk Deletion**: Attempting to delete the entire collection.
11. **The Field Injection**: Adding a `role: 'admin'` field to a user profile (system-field).
12. **The Timestamp Spoof**: Providing a future `createdAt` from the client.

## Test Runner Plan
- [ ] Verify `allow read` for all users on `products`.
- [ ] Verify `allow create` fails if `name` is missing.
- [ ] Verify `allow create` succeeds with valid schema and server timestamp.
- [ ] Verify `allow update` fails for immutable fields like `createdAt`.
