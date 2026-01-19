import { compare } from 'bcryptjs';

export async function hashPassword(password) {
  const bcrypt = await import('bcryptjs');
  return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hashedPassword) {
  return await compare(password, hashedPassword);
}
