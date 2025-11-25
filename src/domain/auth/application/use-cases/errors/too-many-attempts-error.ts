export class TooManyAttemptsError extends Error {
  constructor(timeRemaining: number) {
    super(
      `Too many failed attempts. Try again in ${Math.ceil(
        timeRemaining / 60
      )} minutes.`
    );
  }
}
