"use client";

import { AnimatePresence } from "framer-motion";
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
 * The shell keeps this component MOUNTED once it has been shown once
 * (`hasShownDiagram` in `Studio.tsx`), and passes `showDiagram` down, so the
 * `AnimatePresence` exit animation is preserved: closing the diagram animates it
 * out instead of unmounting it instantly, while a session that never opens the ERD
 * never loads framer-motion at all.
 */
interface DiagramOverlayProps {
  showDiagram: boolean;
  schema: readonly DetailedObject[];
  capabilities?: ProviderCapabilities;
  onClose: () => void;
}

export function DiagramOverlay({ showDiagram, schema, capabilities, onClose }: DiagramOverlayProps) {
  return (
    <AnimatePresence>
      {showDiagram && (
        <ChunkBoundary label="The diagram">
          <SchemaDiagram schema={schema} capabilities={capabilities} onClose={onClose} />
        </ChunkBoundary>
      )}
    </AnimatePresence>
  );
}
