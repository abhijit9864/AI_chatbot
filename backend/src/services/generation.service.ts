import { AbortController } from "node-abort-controller";

const activeGenerations = new Map<string, AbortController>();

export function registerGeneration(
  generationId: string,
  controller: AbortController,
) {
  activeGenerations.set(generationId, controller);
}

export function cancelGeneration(generationId: string): boolean {
  const controller = activeGenerations.get(generationId);

  if (!controller) {
    return false;
  }

  controller.abort();
  activeGenerations.delete(generationId);

  return true;
}

export function removeGeneration(generationId: string) {
  activeGenerations.delete(generationId);
}