import { Request, Response } from "express";
import { cancelGeneration } from "../services/generation.service";

export function stopGenerationController(
  req: Request,
  res: Response,
) {
  try {
    const generationId = String(req.params.generationId);

    if (!generationId) {
      return res.status(400).json({
        message: "Generation ID is required",
      });
    }

    const cancelled = cancelGeneration(generationId);

    if (!cancelled) {
      return res.status(404).json({
        message: "Generation not found or already completed",
      });
    }

    console.log("[AI] Generation cancelled:", generationId);

    return res.status(200).json({
      message: "Generation stopped",
    });
  } catch (error) {
    console.error("Stop generation error:", error);

    return res.status(500).json({
      message: "Failed to stop generation",
    });
  }
}