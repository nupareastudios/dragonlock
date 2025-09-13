### src/core/password.ts

- `generatePassword(length=20, alphabet="base64url")`
  - Cryptographically random characters using Node `randomBytes`.
  - Alphabets:
    - `base64url`: URL-safe characters
    - `ascii`: includes a rich symbol set
    - `alnum`: A-Z a-z 0-9 only
    - `alnum-symbols`: alnum plus a safe symbols subset
    - `hex`: lowercase hex digits
    - `numeric`: digits only 