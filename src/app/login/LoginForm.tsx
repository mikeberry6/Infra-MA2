"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { TextInput } from "@/components/shared/TextInput";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
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

    router.push(result?.url || callbackUrl);
    router.refresh();
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
        autoComplete="current-password"
        required
      />
      {error && (
        <p className="text-xs text-[#b91c1c]" role="alert">
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
