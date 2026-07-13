import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ComingSoonProps {
  title: string;
  description?: string;
}

export default function ComingSoon({
  title,
  description = "This page is currently under development and will be available soon.",
}: ComingSoonProps) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="max-w-xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Construction className="h-8 w-8 text-primary" />
        </div>

        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Coming Soon
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          {title}
        </h1>

        <p className="mt-4 leading-7 text-muted-foreground">
          {description}
        </p>

        <Link
          href="/"
          className={cn(buttonVariants(), "mt-8")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </div>
    </main>
  );
}
