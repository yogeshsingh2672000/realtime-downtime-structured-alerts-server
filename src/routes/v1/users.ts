import { Router } from "express";
import { UsersRepository } from "../../db/index.js";
import { authenticateToken } from "../../middleware/auth.js";

export const usersRouter = Router();

// Create user (admin only)
usersRouter.post("/", authenticateToken, async (req, res, next) => {
	try {
		const created = await UsersRepository.createUser(req.body);
		res.status(201).json(created);
	} catch (err) {
		next(err);
	}
});

// List users (admin only)
usersRouter.get("/", authenticateToken, async (_req, res, next) => {
	try {
		const users = await UsersRepository.listUsers();
		res.json(users);
	} catch (err) {
		next(err);
	}
});

// Get by id (admin only)
usersRouter.get("/:id", authenticateToken, async (req, res, next) => {
	try {
		const id = Number(req.params.id);
		const user = await UsersRepository.getUserById(id);
		if (!user) return res.status(404).json({ error: "not_found" });
		res.json(user);
	} catch (err) {
		next(err);
	}
});

// Update by id (admin only)
usersRouter.put("/:id", authenticateToken, async (req, res, next) => {
	try {
		const id = Number(req.params.id);
		const updated = await UsersRepository.updateUser(id, req.body);
		res.json(updated);
	} catch (err) {
		next(err);
	}
});

// Delete by id (admin only)
usersRouter.delete("/:id", authenticateToken, async (req, res, next) => {
	try {
		const id = Number(req.params.id);
		await UsersRepository.deleteUser(id);
		res.status(204).send();
	} catch (err) {
		next(err);
	}
});


