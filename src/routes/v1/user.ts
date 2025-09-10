import { Router, Request } from "express";
import { UsersRepository } from "../../db/index.js";

function mapUserForClient(u: any) {
	return {
		id: String(u.id),
		first_name: u.first_name,
		last_name: u.last_name,
		email: u.email,
		phone_number: u.phone_number,
		date_of_birth: u.date_of_birth,
		admin: u.admin,
		created_at: Date.parse(u.created_at),
		updated_at: u.updated_at ? Date.parse(u.updated_at) : null,
	};
}

type SessionCookie = {
	sessionId: string;
	user: { id: string; name: string; email: string; provider: string };
};

function getSession(req: Request): SessionCookie | null {
	const raw = req.cookies?.["session"];
	if (!raw) return null;
	try {
		return JSON.parse(raw) as SessionCookie;
	} catch {
		return null;
	}
}

export const userRouter = Router();

// GET /api/user — fetch profile for current session user (by email)
userRouter.get("/", async (req, res, next) => {
	try {
		const session = getSession(req);
		const email = session?.user?.email ?? "yk.kumar2672@gmail.com";
		const found = await UsersRepository.getUserByEmail(email);
		if (!found) return res.json({ profile: null });
		res.json({ profile: mapUserForClient(found) });
	} catch (err) {
		next(err);
	}
});

// PUT /api/user — upsert profile for current session user (by email)
userRouter.put("/", async (req, res, next) => {
	try {
		const session = getSession(req);
		const email = session?.user?.email ?? "yk.kumar2672@gmail.com";
		const existing = await UsersRepository.getUserByEmail(email);
		if (!existing) {
			const created = await UsersRepository.createUserIfNotExists({ ...req.body, email });
			return res.json({ profile: mapUserForClient(created) });
		}
		const updated = await UsersRepository.updateUser(existing.id, { ...req.body, email });
		return res.json({ profile: mapUserForClient(updated) });
	} catch (err) {
		next(err);
	}
});


