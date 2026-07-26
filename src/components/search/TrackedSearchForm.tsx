"use client";

import { Search } from "lucide-react";
import { track } from "@vercel/analytics";
import type { FormEvent } from "react";
import { TextInput } from "@/components/shared/TextInput";
import { Button } from "@/components/shared/Button";
import type { SearchScope } from "@/modules/search/queries";

export function TrackedSearchForm({
  query,
  scope = "all",
}: {
  query: string;
  scope?: SearchScope;
}) {
  function trackSearch(event: FormEvent<HTMLFormElement>) {
    const submitted = new FormData(event.currentTarget).get("q");
    track("search_submitted", {
      surface: "global_search",
      has_query: typeof submitted === "string" && submitted.trim().length > 0,
    });
  }

  return (
    <form
      method="get"
      className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center"
      onSubmit={trackSearch}
    >
      <label htmlFor="site-search" className="sr-only">
        Search InfraSight databases
      </label>
      <TextInput
        id="site-search"
        type="search"
        name="q"
        size="md"
        minLength={2}
        defaultValue={query}
        leadingIcon={<Search />}
        placeholder="Search deals, companies, funds, or buyers..."
        autoFocus={!query}
      />
      {scope !== "all" && <input type="hidden" name="scope" value={scope} />}
      <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto">
        Search
      </Button>
    </form>
  );
}
