import { createHash } from 'crypto';

export function pad2(n: number) {
  return String(n).padStart(2, '0');
}

export function formatDateTime(d = new Date()) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

export function genBizId(prefix: string) {
  const d = new Date();
  const stamp = `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}${pad2(d.getHours())}${pad2(d.getMinutes())}${pad2(d.getSeconds())}`;
  const rand = Math.floor(Math.random() * 90 + 10);
  return `${prefix}${stamp}${rand}`.slice(0, 18);
}

export function shortHash(input: string) {
  return createHash('sha256').update(input).digest('hex').slice(0, 16);
}

export function ok<T>(data: T, msg = 'ok') {
  return { code: 0, msg, data };
}
