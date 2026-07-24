import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TextInput } from "./TextInput";
import {
  CheckboxOption,
  FormField,
  FormMessage,
  SelectInput,
  TextArea,
} from "./FormControls";

describe("shared form controls", () => {
  it("associates a required field label and hint with its input", () => {
    render(
      <FormField
        htmlFor="company-name"
        label="Company name"
        required
        hint="Use the canonical legal name."
      >
        <TextInput
          id="company-name"
          aria-describedby="company-name-hint"
          required
        />
      </FormField>,
    );

    const input = screen.getByRole("textbox", { name: /company name/i });
    expect(input).toBeRequired();
    expect(input).toHaveAccessibleDescription("Use the canonical legal name.");
  });

  it("gives errors an alert role and successes a status role", () => {
    const { rerender } = render(
      <FormMessage tone="error">Unable to save</FormMessage>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Unable to save");

    rerender(<FormMessage tone="success">Saved</FormMessage>);
    expect(screen.getByRole("status")).toHaveTextContent("Saved");
  });

  it("supports controlled checkbox selections", async () => {
    const onChange = vi.fn();
    render(
      <CheckboxOption checked={false} onChange={onChange}>
        Digital
      </CheckboxOption>,
    );

    await userEvent.click(screen.getByRole("checkbox", { name: "Digital" }));
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("forwards native select and textarea semantics", () => {
    render(
      <>
        <label htmlFor="sector">Sector</label>
        <SelectInput id="sector" defaultValue="Digital">
          <option>Digital</option>
          <option>Utilities</option>
        </SelectInput>
        <label htmlFor="description">Description</label>
        <TextArea id="description" defaultValue="Infrastructure asset" />
      </>,
    );

    expect(screen.getByRole("combobox", { name: "Sector" })).toHaveValue("Digital");
    expect(screen.getByRole("textbox", { name: "Description" })).toHaveValue(
      "Infrastructure asset",
    );
  });
});
