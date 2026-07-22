"use client";

import { Search } from "lucide-react";
import { track } from "@vercel/analytics";
import { TextInput } from "@/components/shared/TextInput";

export function TrackedSearchForm({ query }: { query: string }) {
  return (
    <form
      method="get"
      className="mb-6"
      onSubmit={() => track("search_submitted", { surface: "global_search", has_query: true })}
    >
      <TextInput
        type="search"
        name="q"
        size="md"
        defaultValue={query}
        leadingIcon={<Search />}
        placeholder="Search deals, companies, and funds..."
        autoFocus
      />
    </form>
  );
}
