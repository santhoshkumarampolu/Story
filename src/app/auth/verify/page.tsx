import Link from "next/link";

interface VerifyPageProps {
  searchParams: Promise<{
    status?: string;
    reason?: string;
  }>;
}

const statusCopy = {
  success: {
    title: "Email verified",
    description: "Your email has been confirmed. You can now sign in to your account.",
    actionLabel: "Go to sign in",
    actionHref: "/auth/signin"
  },
  missing_params: {
    title: "Verification link incomplete",
    description: "The verification link is missing information. Please request a new verification email and try again.",
    actionLabel: "Return to sign in",
    actionHref: "/auth/signin"
  },
  invalid_token: {
    title: "Invalid verification link",
    description: "We could not verify your email with this link. It may have already been used or is invalid.",
    actionLabel: "Request a new link",
    actionHref: "/auth/signin"
  },
  expired: {
    title: "Verification link expired",
    description: "Your verification link has expired. Please request a new one to finish setting up your account.",
    actionLabel: "Send a new link",
    actionHref: "/auth/signin"
  }
} as const;

const errorReasonSet = new Set<keyof typeof statusCopy>(["missing_params", "invalid_token", "expired"]);

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const params = await searchParams;
  const isSuccess = params.status === "success";
  const reasonParam = params.reason as keyof typeof statusCopy | undefined;
  const reason: keyof typeof statusCopy = isSuccess
    ? "success"
    : reasonParam && errorReasonSet.has(reasonParam)
      ? reasonParam
      : "invalid_token";

  const content = statusCopy[reason];

  return (
    <div className="relative min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />
      <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-lg border border-white/10 bg-white/5 backdrop-blur-lg p-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-white">{content.title}</h1>
          <p className="mt-3 text-sm text-white/60">{content.description}</p>
          <Link
            href={content.actionHref}
            className="mt-6 inline-flex items-center justify-center rounded-md bg-white text-black px-5 py-2 text-sm font-medium shadow-sm transition hover:bg-white/90"
          >
            {content.actionLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
