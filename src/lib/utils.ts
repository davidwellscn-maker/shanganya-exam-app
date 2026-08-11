export function cn(...inputs: (string | undefined | false | null | 0)[]): string {
  return inputs.filter(Boolean).join(" ");
}
