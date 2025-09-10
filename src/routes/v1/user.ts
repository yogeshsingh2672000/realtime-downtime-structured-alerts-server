import { Router, Request } from "express";
import { UsersRepository } from "../../db/index.js";
import { authenticateToken } from "../../middleware/auth.js";

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

export const userRouter = Router();

// GET /api/user — fetch profile for current authenticated user
userRouter.get("/", authenticateToken, async (req, res, next) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'unauthorized', message: 'User not authenticated' });
		}

		const found = await UsersRepository.getUserById(req.user.id);
		if (!found) return res.json({ profile: null });
		res.json({ profile: mapUserForClient(found) });
	} catch (err) {
		next(err);
	}
});

// PUT /api/user — update profile for current authenticated user
userRouter.put("/", authenticateToken, async (req, res, next) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'unauthorized', message: 'User not authenticated' });
		}

		const existing = await UsersRepository.getUserById(req.user.id);
		if (!existing) {
			return res.status(404).json({ error: 'not_found', message: 'User not found' });
		}

		const updated = await UsersRepository.updateUser(req.user.id, req.body);
		return res.json({ profile: mapUserForClient(updated) });
	} catch (err) {
		next(err);
	}
});


