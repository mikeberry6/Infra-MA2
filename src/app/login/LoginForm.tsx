"use client";

import { useState, type FormEvent } from "react";
import { SessionProvider, signIn } from "next-auth/react";
import { LogIn } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { TextInput } from "@/components/shared/TextInput";
import { withBasePath } from "@/lib/base-path";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  return (
    <SessionProvider basePath={withBasePath("/api/auth")} refetchOnWindowFocus={false}>
      <LoginFields callbackUrl={callbackUrl} />
    </SessionProvider>
  );
}

function LoginFields({ callbackUrl }: { callbackUrl: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setLoading(false);

    if (result?.error) {
      setError("The email or password was not recognized.");
      return;
    }

    // Complete authentication with a document navigation. A client push plus
    // an immediate refresh can race the first protected RSC request and leave
    // users at the callback URL with the login render still mounted.
    window.location.assign(result?.url ?? callbackUrl);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <TextInput
        type="email"
        name="email"
        size="md"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Email"
        aria-label="Email address"
        autoComplete="email"
        autoFocus
        required
      />
      <TextInput
        type="password"
        name="password"
        size="md"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Password"
        aria-label="Password"
        autoComplete="current-password"
        required
      />
      {error && (
        <p className="type-meta text-[#b91c1c]" role="alert">
          {error}
        </p>
      )}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={loading}
        leadingIcon={<LogIn className="h-4 w-4" />}
        disabled={!email || !password}
      >
        Sign In
      </Button>
    </form>
  );
}
