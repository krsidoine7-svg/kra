import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  buildAnonymousSessionHash,
  classifyDeviceType,
} from "@/lib/analytics/repository";
import { AnalyticsStatsSection } from "@/components/dashboard/AnalyticsStatsSection";
import { TrashManagerClient } from "@/components/dashboard/TrashManagerClient";

describe("Module M2.5 — Analytics Privacy-First & Corbeille Soft Delete", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("classifie proprement mobile, tablet et desktop et isole les empreintes de session par jour", () => {
    expect(
      classifyDeviceType("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile")
    ).toBe("mobile");
    expect(
      classifyDeviceType("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit")
    ).toBe("tablet");
    expect(
      classifyDeviceType("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0")
    ).toBe("desktop");

    const day1 = buildAnonymousSessionHash({
      ipAddress: "41.202.1.1",
      userAgent: "Chrome",
      now: new Date("2026-04-01T10:00:00Z"),
    });
    const day2 = buildAnonymousSessionHash({
      ipAddress: "41.202.1.1",
      userAgent: "Chrome",
      now: new Date("2026-04-02T10:00:00Z"),
    });
    expect(day1).toMatch(/^[a-f0-9]{64}$/);
    expect(day1).not.toBe(day2);
  });

  it("affiche les statistiques agrégées (vues, partages '...', appareils)", () => {
    render(
      <AnalyticsStatsSection
        summary={{
          totalProjectViews: 42,
          totalArticleViews: 19,
          totalSharesAndCopies: 11,
          deviceBreakdown: { mobile: 6, tablet: 2, desktop: 2 },
          topTargets: [{ targetSlug: "observatoire-marches-abidjan", eventCount: 25 }],
        }}
      />
    );

    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("11")).toBeInTheDocument();
    expect(screen.getByText("19")).toBeInTheDocument();
    expect(screen.getByText(/6 \(60 %\)/)).toBeInTheDocument();
    expect(screen.getByText(/\/observatoire-marches-abidjan/)).toBeInTheDocument();
  });

  it("permet de restaurer un élément soft-deleted depuis la Corbeille (T-M2.5-02)", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <TrashManagerClient
        initialItems={[
          {
            id: "00000000-0000-0000-0000-000000000701",
            entityType: "project",
            label: "Étude Corridor Abidjan-Lagos",
            slug: "etude-corridor-abidjan-lagos",
            deletedAt: "2026-04-01T12:00:00.000Z",
          },
        ]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /restaurer/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Projet « Étude Corridor Abidjan-Lagos » restauré/i)
      ).toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/trash",
      expect.objectContaining({ method: "POST" })
    );
  });
});

