"use client";

import { Search } from "lucide-react";
import { track } from "@vercel/analytics";
import type { FormEvent } from "react";
import { TextInput } from "@/components/shared/TextInput";
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
      className="mb-6"
      onSubmit={trackSearch}
    >
      {scope !== "all" && <input type="hidden" name="scope" value={scope} />}
      <TextInput
        type="search"
        name="q"
        size="md"
        defaultValue={query}
        leadingIcon={<Search />}
        placeholder="Search deals, companies, and funds..."
        aria-label="Search deals, companies, and funds"
        autoFocus
      />
    </form>
  );
}
