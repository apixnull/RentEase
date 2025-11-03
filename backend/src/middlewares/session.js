import session from "express-session";
import redis from "../libs/redisClient.js";

class UpstashSessionStore extends session.Store {
	constructor(options) {
		super();
		const { client, prefix = "sess:", ttlMs = 7 * 24 * 60 * 60 * 1000 } = options || {};
		if (!client) throw new Error("UpstashSessionStore requires a Redis client");
		this.client = client;
		this.prefix = prefix;
		this.ttlMs = ttlMs;
	}
	_key(sid) { return `${this.prefix}${sid}`; }
	async get(sid, cb) {
		try {
			const data = await this.client.get(this._key(sid));
			if (!data) return cb(null, null);
			const sess = typeof data === "string" ? JSON.parse(data) : data;
			return cb(null, sess);
		} catch (err) { return cb(err); }
	}
	async set(sid, sess, cb) {
		try {
			const value = JSON.stringify(sess);
			await this.client.set(this._key(sid), value, { px: this.ttlMs });
			return cb && cb(null);
		} catch (err) { return cb && cb(err); }
	}
	async destroy(sid, cb) {
		try { await this.client.del(this._key(sid)); return cb && cb(null); }
		catch (err) { return cb && cb(err); }
	}
	async touch(sid, sess, cb) {
		try {
			if (this.client.pexpire) {
				await this.client.pexpire(this._key(sid), this.ttlMs);
			} else {
				const value = JSON.stringify(sess);
				await this.client.set(this._key(sid), value, { px: this.ttlMs });
			}
			return cb && cb(null);
		} catch (err) { return cb && cb(err); }
	}
}

const sessionMiddleware = session({
	store: new UpstashSessionStore({ client: redis, prefix: "sess:", ttlMs: 7 * 24 * 60 * 60 * 1000 }),
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	rolling: true,
	cookie: {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		maxAge: 7 * 24 * 60 * 60 * 1000,
	},
});

export default sessionMiddleware;
