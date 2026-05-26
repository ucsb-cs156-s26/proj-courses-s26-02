import { vi } from "vitest";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";

import CourseOverTimeDescriptionSearchForm from "main/components/BasicCourseSearch/CourseOverTimeDescriptionSearchForm";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { useSystemInfo } from "main/utils/systemInfo";

vi.mock("main/utils/systemInfo", () => ({
  useSystemInfo: vi.fn(),
}));

describe("CourseOverTimeDescriptionSearchForm tests", () => {
  const queryClient = new QueryClient();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useSystemInfo.mockReturnValue({
      data: systemInfoFixtures.showingNeither,
      isLoading: false,
      isError: false,
    });
  });

  const renderComponent = (fetchJSON) =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CourseOverTimeDescriptionSearchForm fetchJSON={fetchJSON} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

  test("renders header and description", () => {
    renderComponent();
    expect(
      screen.getByRole("heading", {
        name: /search course descriptions over time/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /find courses whose catalog descriptions contain the terms you enter/i,
      ),
    ).toBeInTheDocument();
  });

  test("when I select a start quarter, the state for start quarter changes", () => {
    renderComponent();
    const selectStartQuarter = screen.getByLabelText("Start Quarter");
    userEvent.selectOptions(selectStartQuarter, "20201");
    expect(selectStartQuarter.value).toBe("20201");
  });

  test("when I select an end quarter, the state for end quarter changes", () => {
    renderComponent();
    const selectEndQuarter = screen.getByLabelText("End Quarter");
    userEvent.selectOptions(selectEndQuarter, "20204");
    expect(selectEndQuarter.value).toBe("20204");
  });

  test("when I type search terms, the state for search terms changes", () => {
    renderComponent();
    const searchTerms = screen.getByLabelText("Search Terms");
    userEvent.type(searchTerms, "research");
    expect(searchTerms.value).toBe("research");
  });

  test("when I select the checkbox, the state for checkbox changes", () => {
    vi.spyOn(Storage.prototype, "setItem");
    renderComponent();

    const selectCheckbox = screen.getByTestId(
      "CourseOverTimeDescriptionSearchForm-checkbox",
    );
    userEvent.click(selectCheckbox);

    expect(selectCheckbox.checked).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "CourseOverTimeDescriptionSearch.Checkbox",
      "true",
    );
  });

  test("when I click submit, fetchJSON is called with the correct values", async () => {
    const fetchJSONSpy = vi.fn().mockResolvedValue({});

    renderComponent(fetchJSONSpy);

    const selectStartQuarter = screen.getByLabelText("Start Quarter");
    userEvent.selectOptions(selectStartQuarter, "20211");
    const selectEndQuarter = screen.getByLabelText("End Quarter");
    userEvent.selectOptions(selectEndQuarter, "20214");
    const searchTerms = screen.getByLabelText("Search Terms");
    userEvent.type(searchTerms, "biology");
    const selectCheckbox = screen.getByTestId(
      "CourseOverTimeDescriptionSearchForm-checkbox",
    );
    userEvent.click(selectCheckbox);
    const submitButton = screen.getByRole("button", { name: /submit/i });
    userEvent.click(submitButton);

    await waitFor(() => expect(fetchJSONSpy).toHaveBeenCalledTimes(1));

    expect(fetchJSONSpy).toHaveBeenCalledWith(expect.any(Object), {
      startQuarter: "20211",
      endQuarter: "20214",
      searchTerms: "biology",
      checkbox: true,
    });
  });

  test("button padding is correct", () => {
    renderComponent();
    const submitButton = screen.getByRole("button", { name: /submit/i });
    const buttonCol = submitButton.parentElement;
    const buttonRow = buttonCol.parentElement;
    expect(buttonRow).toHaveAttribute(
      "style",
      "padding-top: 10px; padding-bottom: 10px;",
    );
  });

  test("bottom row has correct test ID", () => {
    renderComponent();
    const bottomRow = screen.getByTestId(
      "CourseOverTimeDescriptionSearchForm-bottom-row",
    );
    expect(bottomRow).toBeInTheDocument();
  });

  test("uses default values when localStorage is empty", () => {
    renderComponent();
    const selectStartQuarter = screen.getByLabelText("Start Quarter");
    const selectEndQuarter = screen.getByLabelText("End Quarter");
    const searchTerms = screen.getByLabelText("Search Terms");
    const selectCheckbox = screen.getByTestId(
      "CourseOverTimeDescriptionSearchForm-checkbox",
    );

    expect(selectStartQuarter.value).toBeTruthy();
    expect(selectEndQuarter.value).toBeTruthy();
    expect(searchTerms.value).toBe("");
    expect(selectCheckbox.checked).toBe(false);
  });

  test("uses saved values from localStorage when available", () => {
    localStorage.setItem(
      "CourseOverTimeDescriptionSearch.StartQuarter",
      "20201",
    );
    localStorage.setItem("CourseOverTimeDescriptionSearch.EndQuarter", "20204");
    localStorage.setItem(
      "CourseOverTimeDescriptionSearch.SearchTerms",
      "machine learning",
    );
    localStorage.setItem("CourseOverTimeDescriptionSearch.Checkbox", "true");

    const { rerender } = renderComponent();

    rerender(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CourseOverTimeDescriptionSearchForm fetchJSON={() => {}} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const selectStartQuarter = screen.getByLabelText("Start Quarter");
    const selectEndQuarter = screen.getByLabelText("End Quarter");
    const searchTerms = screen.getByLabelText("Search Terms");
    const selectCheckbox = screen.getByTestId(
      "CourseOverTimeDescriptionSearchForm-checkbox",
    );

    expect(selectStartQuarter.value).toBe("20201");
    expect(selectEndQuarter.value).toBe("20204");
    expect(searchTerms.value).toBe("machine learning");
    expect(selectCheckbox.checked).toBe(true);
  });

  test("updates localStorage when search terms change", () => {
    vi.spyOn(Storage.prototype, "setItem");
    renderComponent();

    const searchTerms = screen.getByLabelText("Search Terms");
    userEvent.type(searchTerms, "algorithms");

    expect(localStorage.setItem).toHaveBeenCalledWith(
      "CourseOverTimeDescriptionSearch.SearchTerms",
      expect.stringContaining("algorithms"),
    );
  });

  test("updates localStorage when checkbox is toggled", () => {
    vi.spyOn(Storage.prototype, "setItem");
    renderComponent();

    const selectCheckbox = screen.getByTestId(
      "CourseOverTimeDescriptionSearchForm-checkbox",
    );
    userEvent.click(selectCheckbox);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      "CourseOverTimeDescriptionSearch.Checkbox",
      "true",
    );

    userEvent.click(selectCheckbox);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      "CourseOverTimeDescriptionSearch.Checkbox",
      "false",
    );
  });

  test("render form with all fields present", () => {
    renderComponent();

    expect(screen.getByLabelText("Start Quarter")).toBeInTheDocument();
    expect(screen.getByLabelText("End Quarter")).toBeInTheDocument();
    expect(screen.getByLabelText("Search Terms")).toBeInTheDocument();
    expect(
      screen.getByTestId("CourseOverTimeDescriptionSearchForm-checkbox"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  test("clear checkbox and resubmit with unchecked state", async () => {
    const fetchJSONSpy = vi.fn().mockResolvedValue({});

    renderComponent(fetchJSONSpy);

    const selectCheckbox = screen.getByTestId(
      "CourseOverTimeDescriptionSearchForm-checkbox",
    );
    userEvent.click(selectCheckbox);
    expect(selectCheckbox.checked).toBe(true);

    userEvent.click(selectCheckbox);
    expect(selectCheckbox.checked).toBe(false);

    const submitButton = screen.getByRole("button", { name: /submit/i });
    userEvent.click(submitButton);

    await waitFor(() => expect(fetchJSONSpy).toHaveBeenCalledTimes(1));

    expect(fetchJSONSpy).toHaveBeenCalledWith(expect.any(Object), {
      startQuarter: expect.any(String),
      endQuarter: expect.any(String),
      searchTerms: "",
      checkbox: false,
    });
  });
});
