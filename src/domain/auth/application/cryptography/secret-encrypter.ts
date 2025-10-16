export abstract class SecretEncrypter {
  abstract encrypt(plainText: string): Promise<string>;
  abstract decrypt(encryptedText: string): Promise<string>;
}
