import { renderHook, act, waitFor } from "@testing-library/react";
import { useAsync } from "@/components/shared/page-container";

const deferred = <T,>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), 10));

describe("useAsync", () => {
  beforeEach(() => jest.useFakeTimers());

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it("loads the loader and exposes its result", async () => {
    const loader = jest.fn(() => deferred([1, 2, 3]));
    const { result } = renderHook(() => useAsync(loader, [] as number[]));

    expect(result.current.loading).toBe(true);
    await act(async () => {
      jest.advanceTimersByTime(20);
    });
    expect(result.current.data).toEqual([1, 2, 3]);
    expect(result.current.loading).toBe(false);
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it("falls back when the loader rejects", async () => {
    const loader = jest.fn(() => Promise.reject(new Error("nope")));
    const { result } = renderHook(() => useAsync(loader, "fallback"));

    await act(async () => {
      await Promise.resolve();
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBe("fallback");
  });

  it("re-runs the loader when deps change", async () => {
    const loader = jest.fn((key: number) => deferred(key));
    const { result, rerender } = renderHook(
      ({ key }) => useAsync(() => loader(key), 0, [key]),
      { initialProps: { key: 1 } },
    );

    await act(async () => {
      jest.advanceTimersByTime(20);
    });
    expect(result.current.data).toBe(1);

    rerender({ key: 2 });
    await act(async () => {
      jest.advanceTimersByTime(20);
    });
    expect(result.current.data).toBe(2);
    expect(loader).toHaveBeenCalledTimes(2);
  });
});