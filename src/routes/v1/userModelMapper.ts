import { Router } from "express";
import { UserModelMapperRepository } from "../../db/index.js";
import { authenticateToken } from "../../middleware/auth.js";

export const userModelMapperRouter = Router();

function mapForClient(r: any) {
	return {
		id: String(r.id),
		created_at: Date.parse(r.created_at),
		updated_at: r.updated_at ? Date.parse(r.updated_at) : null,
		user_id: r.user_id,
		model_id: r.model_id,
	};
}

// List (authenticated users only)
userModelMapperRouter.get("/", authenticateToken, async (req, res, next) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'unauthorized', message: 'User not authenticated' });
		}

		const hasUserId = typeof req.query.userId !== 'undefined';
		const parsed = hasUserId ? Number(req.query.userId) : undefined;
		if (hasUserId && (parsed == null || Number.isNaN(parsed))) {
			return res.status(400).json({ error: "invalid_query" });
		}
		const userId = parsed;
		const items = userId != null
			? await UserModelMapperRepository.listUserModelMapsByUser(userId)
			: await UserModelMapperRepository.listUserModelMaps();
		res.json({ items: items.map(mapForClient) });
	} catch (err) {
		next(err);
	}
});

// Create (authenticated users only)
userModelMapperRouter.post("/", authenticateToken, async (req, res, next) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'unauthorized', message: 'User not authenticated' });
		}

		const created = await UserModelMapperRepository.createUserModelMap(req.body);
		res.status(201).json({ item: mapForClient(created) });
	} catch (err) {
		next(err);
	}
});

// Update (authenticated users only)
userModelMapperRouter.put("/:id", authenticateToken, async (req, res, next) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'unauthorized', message: 'User not authenticated' });
		}

		const id = Number(req.params.id);
		const body = { ...req.body, updated_at: new Date().toISOString() };
		const updated = await UserModelMapperRepository.updateUserModelMap(id, body);
		res.json({ item: mapForClient(updated) });
	} catch (err) {
		next(err);
	}
});

// Delete (authenticated users only)
userModelMapperRouter.delete("/:id", authenticateToken, async (req, res, next) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'unauthorized', message: 'User not authenticated' });
		}

		const id = Number(req.params.id);
		const deleted = await UserModelMapperRepository.deleteUserModelMap(id);
		if (!deleted) return res.status(404).json({ error: "not_found" });
		res.status(200).json({ ok: true });
	} catch (err) {
		next(err);
	}
});


