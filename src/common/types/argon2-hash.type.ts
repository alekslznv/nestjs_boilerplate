declare const __argon2Hash: unique symbol;

/**
 * Branded type for argon2-hashed strings.
 * Prevents accidental use of plain strings where a hash is expected.
 */
export type Argon2Hash = string & { readonly [__argon2Hash]: true };

const ARGON2_HASH_REGEX =
  /^\$argon2(id|i|d)\$v=\d+\$m=\d+,t=\d+,p=\d+\$.+\$.+$/;

export function isArgon2Hash(value: string): value is Argon2Hash {
  return ARGON2_HASH_REGEX.test(value);
}

export function toArgon2Hash(value: string): Argon2Hash {
  if (!isArgon2Hash(value)) {
    throw new Error('Invalid argon2 hash format');
  }
  return value;
}
