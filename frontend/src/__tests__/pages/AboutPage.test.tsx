import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import AboutPage from "../../pages/AboutPage";

describe("AboutPage", () => {
  it("renders the main heading", () => {
    const { getByText } = render(<AboutPage />);
    expect(getByText("About Our Blog")).toBeInTheDocument();
  });

  it("renders all three main sections", () => {
    const { getByText } = render(<AboutPage />);
    expect(getByText("Our Mission")).toBeInTheDocument();
    expect(getByText("The Team")).toBeInTheDocument();
    expect(getByText("Technology")).toBeInTheDocument();
  });

  it("displays the tech stack information", () => {
    const { getByText } = render(<AboutPage />);
    expect(getByText(/React/)).toBeInTheDocument();
    expect(getByText(/Tailwind CSS/)).toBeInTheDocument();
    expect(getByText(/Spring Boot/)).toBeInTheDocument();
    expect(getByText(/PostgreSQL/)).toBeInTheDocument();
  });

  it("renders all tech stack images", () => {
    const { getAllByRole, getByAltText } = render(<AboutPage />);
    const images = getAllByRole("img");
    expect(images).toHaveLength(4); // React, Tailwind, Spring Boot, PostgreSQL

    const altTexts = ["React", "Tailwind CSS", "Spring Boot", "PostgreSQL"];
    altTexts.forEach((alt) => {
      expect(getByAltText(alt)).toBeInTheDocument();
    });
  });
});
