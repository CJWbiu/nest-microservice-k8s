import * as bcrypt from 'bcryptjs';

/**
 * 客户端固定盐（与原版 fenix-bookstore-frontend 保持一致）。
 * 注意：这是 bcrypt 的 salt 前缀，`$2a$10$` 后跟 22 位盐，共 29 个字符。
 */
const CLIENT_SALT = '$2a$10$o5L.dWYEjZjaejOmN3x4Qu';

/**
 * 极简 MD5（十六进制小写输出）。
 * 仅用于对齐原版前端的密码编码流程，不用于任何安全强度要求高于 MD5 的场景。
 */
function md5(input: string): string {
  const toBytes = (str: string): number[] => {
    const bytes: number[] = [];
    // encodeURIComponent + unescape 实现 UTF-8 编码，与 Node crypto 的默认行为一致
    const encoded = unescape(encodeURIComponent(str));
    for (let i = 0; i < encoded.length; i++) bytes.push(encoded.charCodeAt(i));
    return bytes;
  };

  const rotl = (x: number, n: number): number => (x << n) | (x >>> (32 - n));

  const S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];

  const K: number[] = [];
  for (let i = 0; i < 64; i++) {
    K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000) | 0;
  }

  const msg = toBytes(input);
  const bitLen = msg.length * 8;
  msg.push(0x80);
  while (msg.length % 64 !== 56) msg.push(0);
  const low = bitLen >>> 0;
  const high = Math.floor(bitLen / 0x100000000) >>> 0;
  msg.push(low & 0xff, (low >>> 8) & 0xff, (low >>> 16) & 0xff, (low >>> 24) & 0xff);
  msg.push(high & 0xff, (high >>> 8) & 0xff, (high >>> 16) & 0xff, (high >>> 24) & 0xff);

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  for (let i = 0; i < msg.length; i += 64) {
    const M: number[] = [];
    for (let j = 0; j < 16; j++) {
      M[j] =
        msg[i + j * 4] |
        (msg[i + j * 4 + 1] << 8) |
        (msg[i + j * 4 + 2] << 16) |
        (msg[i + j * 4 + 3] << 24);
    }
    let A = a0;
    let B = b0;
    let C = c0;
    let D = d0;
    for (let j = 0; j < 64; j++) {
      let F: number;
      let g: number;
      if (j < 16) {
        F = (B & C) | (~B & D);
        g = j;
      } else if (j < 32) {
        F = (D & B) | (~D & C);
        g = (5 * j + 1) % 16;
      } else if (j < 48) {
        F = B ^ C ^ D;
        g = (3 * j + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * j) % 16;
      }
      F = (F + A + K[j] + M[g]) | 0;
      A = D;
      D = C;
      C = B;
      B = (B + rotl(F, S[j])) | 0;
    }
    a0 = (a0 + A) | 0;
    b0 = (b0 + B) | 0;
    c0 = (c0 + C) | 0;
    d0 = (d0 + D) | 0;
  }

  const toHex = (n: number): string => {
    let s = '';
    for (let i = 0; i < 4; i++) {
      s += ((n >>> (i * 8)) & 0xff).toString(16).padStart(2, '0');
    }
    return s;
  };

  return toHex(a0) + toHex(b0) + toHex(c0) + toHex(d0);
}

/**
 * 登录/注册前对密码做客户端编码，对齐原版前端的处理：
 *
 *   明文 → MD5(hex) → BCrypt(固定客户端盐) → 去掉盐前缀，只保留 31 位哈希体
 *
 * 服务端收到该值后再做一次 BCrypt 存入数据库（即「客户端加盐 + 服务端加盐」双重哈希）。
 */
export function encodePassword(source: string): string {
  const md5hex = md5(source);
  return bcrypt.hashSync(md5hex, CLIENT_SALT).substring(CLIENT_SALT.length);
}
