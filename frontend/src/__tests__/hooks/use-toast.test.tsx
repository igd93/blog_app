import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useToast, toast as toastFunction } from "@/hooks/use-toast";

// Mock timers for testing toast removal
vi.useFakeTimers();

// Create a function to reset the toast state
const resetToastState = () => {
  // Access the internal dispatch function by calling the toast function
  // and then dismissing all toasts
  const { dismiss } = toastFunction({ title: "Reset" });
  dismiss();
  vi.runAllTimers(); // Run timers to remove all toasts
};

describe("useToast hook", () => {
  beforeEach(() => {
    // Reset the toast state before each test
    resetToastState();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it("should add a toast", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: "Test Toast",
        description: "This is a test toast",
      });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe("Test Toast");
    expect(result.current.toasts[0].description).toBe("This is a test toast");
    expect(result.current.toasts[0].open).toBe(true);
  });

  it("should update a toast", () => {
    const { result } = renderHook(() => useToast());

    let toastId: string;

    act(() => {
      const response = result.current.toast({
        title: "Initial Toast",
        description: "Initial description",
      });
      toastId = response.id;
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe("Initial Toast");

    // Update the toast using the update function from the toast controls
    act(() => {
      const toastControls = result.current.toast({
        title: "Another Toast",
      });

      toastControls.update({
        id: toastId,
        title: "Updated Toast",
        description: "Updated description",
      });
    });

    // Due to TOAST_LIMIT = 1, we should only have the most recent toast
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe("Updated Toast");
    expect(result.current.toasts[0].description).toBe("Updated description");
  });

  it("should dismiss a toast", () => {
    const { result } = renderHook(() => useToast());

    let toastId: string;

    act(() => {
      const response = result.current.toast({
        title: "Test Toast",
      });
      toastId = response.id;
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].open).toBe(true);

    act(() => {
      result.current.dismiss(toastId);
    });

    // Toast should still be in the array but marked as closed
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].open).toBe(false);

    // After the timeout, the toast should be removed
    act(() => {
      vi.runAllTimers();
    });

    // Check that the toast was removed
    expect(result.current.toasts).toHaveLength(0);
  });

  it("should dismiss all toasts when no id is provided", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({ title: "Toast 1" });
      result.current.toast({ title: "Toast 2" });
    });

    // Due to the TOAST_LIMIT of 1, we should only have one toast
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe("Toast 2"); // The most recent one

    act(() => {
      result.current.dismiss(); // Dismiss all toasts
    });

    // All toasts should be marked as closed
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].open).toBe(false);

    // After the timeout, all toasts should be removed
    act(() => {
      vi.runAllTimers();
    });

    // Check that all toasts were removed
    expect(result.current.toasts).toHaveLength(0);
  });

  it("should respect the toast limit", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({ title: "Toast 1" });
      result.current.toast({ title: "Toast 2" });
      result.current.toast({ title: "Toast 3" });
    });

    // Due to the TOAST_LIMIT of 1, we should only have one toast
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe("Toast 3"); // The most recent one
  });

  it("should return toast controls with update and dismiss functions", () => {
    const { result } = renderHook(() => useToast());

    // Use a simple approach to avoid TypeScript errors
    let id = "";
    let dismissFn: () => void = () => {};

    act(() => {
      const controls = result.current.toast({
        title: "Test Toast",
      });

      id = controls.id;
      dismissFn = controls.dismiss;
    });

    // Now we can safely check the properties
    expect(id).toBeTruthy();
    expect(typeof dismissFn).toBe("function");

    // Test the dismiss function
    act(() => {
      dismissFn();
    });

    expect(result.current.toasts[0].open).toBe(false);
  });

  it("should handle the standalone toast function", () => {
    // Test the standalone toast function
    let toastId = "";

    act(() => {
      const controls = toastFunction({
        title: "Standalone Toast",
      });

      toastId = controls.id;
    });

    // Render the hook to check if the toast was added
    const { result } = renderHook(() => useToast());

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe("Standalone Toast");
    expect(result.current.toasts[0].id).toBe(toastId);
  });
});
