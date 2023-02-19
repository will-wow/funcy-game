export function forLoop<T>(
  start: number,
  end: number,
  body: (acc: T, i: number) => T,
  initialValue: T
): T {
  let acc = initialValue;

  for (let i = start; i < end; i++) {
    acc = body(acc, i);
  }

  return acc;
}

export function mapN<T>(n: number, fn: (i: number) => T): T[] {
  if (n <= 0) return [];

  const arr = new Array(n);

  for (let i = 0; i < n; i++) {
    arr[i] = fn(i);
  }

  return arr;
}
