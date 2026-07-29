export const Password = {
  hash(password: string): Promise<string> {
    return Bun.password.hash(password, { algorithm: 'argon2id' });
  },

  verify(password: string, hash: string): Promise<boolean> {
    return Bun.password.verify(password, hash);
  },
};
