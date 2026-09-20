import { describe, it, expect, vi } from "vitest";

import type { ExcalidrawElement } from "@excalidraw/element/types";

import { getRemixableSceneInfo, remixScene, trackRemixEvent } from "./remix";

// Minimal element containing only the fields remixScene needs.
const makeElement = (
  overrides: Partial<ExcalidrawElement> = {},
): ExcalidrawElement =>
  ({
    id: "el-1",
    type: "rectangle",
    version: 1,
    versionNonce: 100,
    updated: 1,
    isDeleted: false,
    ...overrides,
  } as unknown as ExcalidrawElement);

describe("getRemixableSceneInfo", () => {
  it("static share link -> remixable, keeps id/key", () => {
    const info = getRemixableSceneInfo(
      { isExternalScene: true, id: "abc", key: "secret" },
      false,
    );
    expect(info).toEqual({
      isRemixable: true,
      sourceId: "abc",
      sourceKey: "secret",
    });
  });

  it("never remixes a live collaboration scene", () => {
    const info = getRemixableSceneInfo(
      { isExternalScene: true, id: "abc", key: "secret" },
      true,
    );
    expect(info.isRemixable).toBe(false);
    expect(info.sourceId).toBeNull();
    expect(info.sourceKey).toBeNull();
  });

  it("not remixable when the scene is not external", () => {
    expect(
      getRemixableSceneInfo(
        { isExternalScene: false, id: "abc", key: "secret" },
        false,
      ).isRemixable,
    ).toBe(false);
  });

  it("not remixable when id or key is missing (e.g. broken/expired link)", () => {
    expect(
      getRemixableSceneInfo(
        { isExternalScene: true, id: "abc", key: null },
        false,
      ).isRemixable,
    ).toBe(false);
    expect(
      getRemixableSceneInfo(
        { isExternalScene: true, id: null, key: "secret" },
        false,
      ).isRemixable,
    ).toBe(false);
    expect(
      getRemixableSceneInfo({ isExternalScene: true }, false).isRemixable,
    ).toBe(false);
  });
});

describe("remixScene", () => {
  it("returns the same number of elements", () => {
    const els = [makeElement({ id: "a" }), makeElement({ id: "b" })];
    expect(remixScene(els, {}).elements).toHaveLength(2);
  });

  it("creates brand-new element objects without mutating the originals", () => {
    const original = makeElement({ id: "a", version: 5, versionNonce: 999 });
    const copy = remixScene([original], {}).elements[0];

    expect(copy).not.toBe(original);
    expect(copy.id).toBe("a");
    expect(copy.version).toBeGreaterThan(5);
    expect(copy.versionNonce).not.toBe(999);

    expect(original.version).toBe(5);
    expect(original.versionNonce).toBe(999);
  });

  it("returns a new appState object (shallow copy)", () => {
    const appState = { viewBackgroundColor: "#fff" } as any;
    const result = remixScene([], appState);
    expect(result.appState).not.toBe(appState);
    expect(result.appState).toEqual(appState);
  });

  it("can be remixed twice, and the first original stays untouched", () => {
    const original = makeElement({ id: "a", version: 1 });
    const first = remixScene([original], {});
    const second = remixScene(first.elements, {});

    expect(second.elements[0].version).toBeGreaterThan(
      first.elements[0].version,
    );
    expect(original.version).toBe(1);
  });

  it("handles an empty scene", () => {
    expect(remixScene([], {}).elements).toEqual([]);
  });
});

describe("trackRemixEvent", () => {
  it("logs the event name and meta", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    trackRemixEvent("remix_clicked", { sourceId: "abc" });
    expect(spy).toHaveBeenCalledWith("[remix]", "remix_clicked", {
      sourceId: "abc",
    });
    spy.mockRestore();
  });
});
