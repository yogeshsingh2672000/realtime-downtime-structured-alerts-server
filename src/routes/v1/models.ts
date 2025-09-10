import { Router } from "express";
import { ModelsRepository } from "../../db/index.js";
import { authenticateToken } from "../../middleware/auth.js";

function mapModelForClient(m: any) {
	return {
		id: String(m.id),
		createdAt: Date.parse(m.created_at),
		updatedAt: m.updated_at ? Date.parse(m.updated_at) : null,
		modelName: m.model_name,
		provider: m.model_provider,
		description: m.description,
		version: m.version,
		updatedBy: m.updated_by,
	};
}

export const modelsRouter = Router();

// List models (public - no auth required)
modelsRouter.get("/", async (_req, res, next) => {
	try {
		const items = await ModelsRepository.listModels();
		res.json(items.map(mapModelForClient));
	} catch (err) {
		next(err);
	}
});

// Create model (authenticated users only)
modelsRouter.post("/", authenticateToken, async (req, res, next) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'unauthorized', message: 'User not authenticated' });
		}

		const updatedByInput = `${req.user.id} - ${req.user.username}`;
		const body = {
			model_name: req.body.modelName ?? req.body.model_name ?? null,
			model_provider: req.body.provider ?? req.body.model_provider ?? null,
			description: req.body.description ?? null,
			version: req.body.version ?? null,
			updated_by: updatedByInput,
		};
		const created = await ModelsRepository.createModel(body as any);
		res.status(201).json({ item: mapModelForClient(created) });
	} catch (err) {
		next(err);
	}
});

// Update model (authenticated users only)
modelsRouter.put("/:id", authenticateToken, async (req, res, next) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'unauthorized', message: 'User not authenticated' });
		}

		const id = Number(req.params.id);
		const updatedByInput = `${req.user.id} - ${req.user.username}`;
		const body = {
			model_name: req.body.modelName ?? req.body.model_name,
			model_provider: req.body.provider ?? req.body.model_provider,
			description: req.body.description,
			version: req.body.version,
			updated_by: updatedByInput,
			updated_at: new Date().toISOString(),
		} as any;
		const updated = await ModelsRepository.updateModel(id, body);
		res.json({ item: mapModelForClient(updated) });
	} catch (err) {
		next(err);
	}
});

// Delete model (authenticated users only)
modelsRouter.delete("/:id", authenticateToken, async (req, res, next) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'unauthorized', message: 'User not authenticated' });
		}

		const id = Number(req.params.id);
		await ModelsRepository.deleteModel(id);
		res.status(204).send();
	} catch (err) {
		next(err);
	}
});


