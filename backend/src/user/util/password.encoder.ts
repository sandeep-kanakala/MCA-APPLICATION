import  bcrypt from 'bcrypt';

export class passwordEncoder{
  public static async hashPassword(plainPassword: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(plainPassword, salt);
  return hashedPassword;
}
}