// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import RuneSelector from "./RuneSelector";

afterEach(cleanup);

const emptyRunes = {
  "무기": [null],
  "방어구": Array(5).fill(null),
  "장신구": Array(3).fill(null),
  "엠블럼": [null],
};

const transcendLevels = {
  "무기": [0],
  "방어구": Array(5).fill(0),
  "장신구": Array(3).fill(0),
  "엠블럼": [0],
};

describe("RuneSelector cleaned description rendering", () => {
  it("preserves decimal values and leading battle conditions", () => {
    render(
      <RuneSelector
        selectedRunes={emptyRunes}
        onRuneChange={vi.fn()}
        transcendLevels={transcendLevels}
        onTranscendChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("무기 룬"));

    expect(screen.getByText(/공격력이 23\.5% 증가/)).toBeInTheDocument();
    expect(screen.getByText(/전투 시 5초마다 불씨름 얻는다 이 효과는 최대 12회까지 중첩/)).toBeInTheDocument();
    expect(screen.queryByText(/^•?\s*5% 증가$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^•?\s*시 5초마다 불씨름 얻는다 이 효과는 최대 12회까지 중첩$/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("ALL"));

    expect(screen.getAllByText(/전투 시,? 1초마다 침식 수치가 5 증가/).length).toBeGreaterThanOrEqual(2);
    expect(screen.queryAllByText(/^•?\s*시,? 1초마다 침식 수치가 5 증가$/)).toHaveLength(0);
  });
});
