import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Lightbulb, 
  FileText, 
  Users, 
  Film, 
  Share2, 
  Settings,
  ArrowRight 
} from "lucide-react";
import Link from "next/link";

interface ProjectPageProps {
  params: {
    projectId: string;
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const project = await prisma.project.findUnique({
    where: {
      id: params.projectId,
      userId: session.user.id,
    },
    include: {
      scenes: true,
      characters: true,
    },
  });

  if (!project) {
    redirect("/projects");
  }

  const steps = [
    {
      name: "Develop Your Idea",
      description: "Start with a concept or let AI help you generate ideas",
      icon: Lightbulb,
      href: "ideas",
      completed: false,
    },
    {
      name: "Create a Logline",
      description: "Write a one-sentence summary of your story",
      icon: FileText,
      href: "logline",
      completed: !!project.logline,
    },
    {
      name: "Develop Characters",
      description: "Create and develop your story's characters",
      icon: Users,
      href: "characters",
      completed: project.characters.length > 0,
    },
    {
      name: "Write Scenes",
      description: "Structure and write your story's scenes",
      icon: Film,
      href: "scenes",
      completed: project.scenes.length > 0,
    },
  ];

  return (
    <div className="container max-w-4xl py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome to {project.title}</h1>
          <p className="text-muted-foreground">
            Let's create your short film step by step
          </p>
        </div>

        <div className="grid gap-4">
          {steps.map((step) => (
            <Card key={step.href} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{step.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="ml-4"
                  asChild
                >
                  <Link href={`/projects/${params.projectId}/${step.href}`}>
                    {step.completed ? "Continue" : "Start"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 