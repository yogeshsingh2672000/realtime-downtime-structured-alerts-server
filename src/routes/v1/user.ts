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
		if (!session?.user?.email) return res.status(401).json({ error: "unauthorized" });
		const found = await UsersRepository.getUserByEmail(session.user.email);
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
		if (!session?.user?.email) return res.status(401).json({ error: "unauthorized" });
		const existing = await UsersRepository.getUserByEmail(session.user.email);
		if (!existing) {
			const created = await UsersRepository.createUserIfNotExists({ ...req.body, email: session.user.email });
			return res.json({ profile: mapUserForClient(created) });
		}
		const updated = await UsersRepository.updateUser(existing.id, { ...req.body, email: session.user.email });
		return res.json({ profile: mapUserForClient(updated) });
	} catch (err) {
		next(err);
	}
});


