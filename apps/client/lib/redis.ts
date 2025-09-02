import Redis from 'ioredis';

type PipelineCommand = [string, ...any[]];

class InMemoryRedis {
  private store = new Map<string, any>();
  private sets = new Map<string, Set<string>>();

  async get(key: string) {
    const v = this.store.get(key);
    return v === undefined ? null : String(v);
    }
  async set(key: string, value: any, ..._args: any[]) {
    this.store.set(key, typeof value === 'string' ? value : JSON.stringify(value));
    return 'OK';
  }
  async incr(key: string) {
    const v = parseInt((await this.get(key)) || '0', 10) + 1;
    await this.set(key, String(v));
    return v;
  }
  async lpush(key: string, value: string) {
    const arr = JSON.parse((await this.get(key)) || '[]');
    arr.unshift(value);
    await this.set(key, JSON.stringify(arr));
    return arr.length;
  }
  async sadd(key: string, member: string) {
    const set = this.sets.get(key) || new Set<string>();
    set.add(member);
    this.sets.set(key, set);
    return 1;
  }
  async smembers(key: string) {
    const set = this.sets.get(key) || new Set<string>();
    return Array.from(set);
  }
  pipeline() {
    const commands: PipelineCommand[] = [];
    const self = this;
    return {
      get(key: string) { commands.push(['get', key]); return this; },
      exec: async () => {
        const results = await Promise.all(commands.map(async ([cmd, key]) => {
          if (cmd === 'get') {
            try { const val = await self.get(key); return [null, val] as const; }
            catch (e) { return [e, null] as const; }
          }
          return [null, null] as const;
        }));
        return results as any;
      }
    };
  }
  multi() {
    const ops: (() => Promise<any>)[] = [];
    const self = this;
    return {
      del(key: string) { ops.push(() => self.del(key)); return this; },
      srem(key: string, member: string) { ops.push(() => self.srem(key, member)); return this; },
      exec: async () => Promise.all(ops).then(() => 'OK'),
    };
  }
  async del(key: string) { this.store.delete(key); return 1; }
  async srem(key: string, member: string) {
    const set = this.sets.get(key);
    if (!set) return 0;
    const had = set.delete(member);
    return had ? 1 : 0;
  }
}

const shouldUseMemory = !process.env.REDIS_URL && process.env.NODE_ENV !== 'production';
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis: any = shouldUseMemory ? new InMemoryRedis() : new Redis(redisUrl);
export const redisSubscriber: any = shouldUseMemory ? new InMemoryRedis() : new Redis(redisUrl);

export default redis;
