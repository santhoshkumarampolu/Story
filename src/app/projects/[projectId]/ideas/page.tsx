import { IdeaGenerator } from "@/components/ideas/idea-generator";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

interface IdeasPageProps {
  params: {
    projectId: string;
  };
}

export default async function IdeasPage({ params }: IdeasPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const project = await prisma.project.findUnique({
    where: {
      id: params.projectId,
      userId: session.user.id,
    },
  });

  if (!project) {
    redirect("/projects");
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Develop Your Idea</h1>
          <p className="text-muted-foreground">
            Start by entering your idea or theme, or let AI help you generate some creative concepts.
          </p>
        </div>

        <IdeaGenerator projectId={params.projectId} />
      </div>
    </div>
  );
} 