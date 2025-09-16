import { Router } from "express";
import { extractImportantInfo } from "../../core/parserEngine.js";

export const aiRouter = Router();

// Testing-only route: no authentication required
aiRouter.post("/extract", async (req, res, next) => {
  try {
    const inputText = typeof req.body?.text === "string" ? req.body.text : "";
    const result = await extractImportantInfo(inputText);
    res.json(result);
  } catch (err) {
    next(err);
  }
});


