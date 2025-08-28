import { Router } from "express";
import { ModelsRepository } from "../../db/index.js";

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

// List models

modelsRouter.get("/", async (_req, res, next) => {
	try {
		const items = await ModelsRepository.listModels();
		res.json(items.map(mapModelForClient));
	} catch (err) {
		next(err);
	}
});

// Create model
modelsRouter.post("/", async (req, res, next) => {
	try {
		const created = await ModelsRepository.createModel(req.body);
		res.status(201).json({ item: mapModelForClient(created) });
	} catch (err) {
		next(err);
	}
});

// Update model
modelsRouter.put("/:id", async (req, res, next) => {
	try {
		const id = Number(req.params.id);
		const body = { ...req.body, updated_at: new Date().toISOString() };
		const updated = await ModelsRepository.updateModel(id, body);
		res.json({ item: mapModelForClient(updated) });
	} catch (err) {
		next(err);
	}
});

// Delete model
modelsRouter.delete("/:id", async (req, res, next) => {
	try {
		const id = Number(req.params.id);
		await ModelsRepository.deleteModel(id);
		res.status(204).send();
	} catch (err) {
		next(err);
	}
});


