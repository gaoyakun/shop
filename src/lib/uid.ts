import * as Long from 'long';
let uniqueId = 1;

/**
 * algorithm from Twitter
 * 1bit(unused) + 41bit(timestamp) + 10bit(serverId) + 12bit(uniqueId)
 */
export function UID (prefix: string, serverId?: number): string {
    if (serverId === undefined) {
        serverId = 1;
    }
    const tm = Long.fromNumber(Date.now(), true);
    const sid = Long.fromNumber(serverId % 0x400, true);
    const uid = Long.fromNumber(uniqueId++ % 0x1000, true);
    let value = tm.shl(22).add(sid.shl(12)).add(uid).toString();
    while (value.length < 20) {
        value = '0' + value;
    }
    if (prefix) {
        value = prefix + value;
    }
    return value;
}
