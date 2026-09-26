import "../../setup-dom";
import "../../helpers/mock-sonner";

import React, { useState } from "react";
import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";

import { Sidebar } from "@/components/sidebar";
import { ConnectionsList } from "@/components/sidebar/ConnectionsList";
import { SchemaExplorer } from "@/components/schema-explorer";
import { AgentRail } from "@/components/agent/AgentRail";
import { AnswerCard } from "@/components/agent/AnswerCard";
import { BottomPanel } from "@/components/studio/BottomPanel";
import { QueryToolbar } from "@/components/studio/QueryToolbar";
import { StudioDesktopHeader } from "@/components/studio/StudioDesktopHeader";
import { StudioMobileHeader } from "@/components/studio/StudioMobileHeader";
import { StudioTabBar } from "@/components/studio/StudioTabBar";

/**
 * X5: `Studio.tsx` re-renders its whole tree on every keystroke.
 *
 * The fix memoizes the shell's children and stabilizes the callbacks it hands them,
 * so a keystroke that only changes the editor's text no longer re-commits the rest of
 * the tree. This file pins the STRUCTURAL half of that fix: each child must be wrapped
 * in `React.memo`, because a plain function component re-renders on every parent render
 * no matter how stable its props are. `React.memo` marks the component with
 * `Symbol.for("react.memo")` — the same marker React itself reads to decide a bail-out —
 * so this is the state that makes the optimisation real, not a symptom of one.
 *
 * The behavioural half — that `Studio.tsx` hands these children STABLE callback
 * identities — is covered by `tests/components/Studio.test.tsx`, which renders the real
 * shell and drives its handlers; a memo wrapper is only effective when the props it
 * compares keep their identity, and the shell's `useCallback`/`useMemo` rewrites are
 * what provide that. Removing the `React.memo` wrapper from any child makes its entry
 * below fail, and removing a `useCallback` from the shell fails the lint rule that
 * `bun run lint` enforces.
 */

const REACT_MEMO = Symbol.for("react.memo");

function isMemoized(component: unknown): boolean {
  return (
    typeof component === "object" && component !== null && (component as { $$typeof?: unknown }).$$typeof === REACT_MEMO
  );
}

describe("studio children are wrapped in React.memo (X5)", () => {
  test.each([
    ["Sidebar", Sidebar],
    ["ConnectionsList", ConnectionsList],
    ["SchemaExplorer", SchemaExplorer],
    ["AgentRail", AgentRail],
    ["AnswerCard", AnswerCard],
    ["BottomPanel", BottomPanel],
    ["QueryToolbar", QueryToolbar],
    ["StudioDesktopHeader", StudioDesktopHeader],
    ["StudioMobileHeader", StudioMobileHeader],
    ["StudioTabBar", StudioTabBar],
  ])("%s is memoized", (_name, component) => {
    expect(isMemoized(component)).toBe(true);
  });
});

describe("memoized children skip re-renders on unchanged props", () => {
  afterEach(cleanup);

  test("React.memo bails out on unchanged props (the mechanism every child above relies on)", () => {
    let renders = 0;
    const Child = React.memo(function Child({ label }: { label: string }) {
      renders += 1;
      return <div>{label}</div>;
    });

    function Harness() {
      const [tick, setTick] = useState(0);
      return (
        <div>
          <button type="button" data-testid="tick" onClick={() => setTick((t) => t + 1)}>
            tick
          </button>
          <Child label="stable" />
        </div>
      );
    }

    const { getByTestId } = render(<Harness />);
    expect(renders).toBe(1);
    fireEvent.click(getByTestId("tick"));
    fireEvent.click(getByTestId("tick"));
    // The child's props never changed, so memo skipped both parent re-renders.
    expect(renders).toBe(1);
  });
});
