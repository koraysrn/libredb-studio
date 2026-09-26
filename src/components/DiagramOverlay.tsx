"use client";

import { ChunkBoundary } from "@/components/LazyView";
import { SchemaDiagram } from "@/components/SchemaDiagram";
import type { DetailedObject } from "@/lib/db/detailed-object";
import type { ProviderCapabilities } from "@/lib/db/types";

/**
 * The ERD, split out of the first load (X5).
 *
 * `Studio.tsx` used to hold `AnimatePresence` (framer-motion) here, which pulled
 * framer-motion into the shell's first-load bundle. This component owns the diagram
 * instead, and the shell loads it with `React.lazy`, so `@xyflow/react`, the elk
 * layout engine, snapdom AND framer-motion reach the browser only once the ERD is
 * first opened.
 *
 * The exit animation `AnimatePresence` provided is deliberately dropped: it is the
 * one behaviour that requires the component (and therefore framer-motion) to stay
 * mounted even while the diagram is closed, which would undo the split. Closing the
 * diagram is now an instant unmount, which the `ChunkBoundary` fallback already
 * covered for the slow-open case.
 */
interface DiagramOverlayProps {
  schema: readonly DetailedObject[];
  capabilities?: ProviderCapabilities;
  onClose: () => void;
}

export function DiagramOverlay({ schema, capabilities, onClose }: DiagramOverlayProps) {
  return (
    <ChunkBoundary label="The diagram">
      <SchemaDiagram schema={schema} capabilities={capabilities} onClose={onClose} />
    </ChunkBoundary>
  );
}
