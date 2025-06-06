import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Lightbulb, 
  FileText, 
  Users, 
  Film, 
  Share2, 
  Settings 
} from "lucide-react";

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: {
    projectId: string;
  };
}

const navigation = [
  {
    name: "Ideas",
    href: "ideas",
    icon: Lightbulb,
  },
  {
    name: "Logline",
    href: "logline",
    icon: FileText,
  },
  {
    name: "Characters",
    href: "characters",
    icon: Users,
  },
  {
    name: "Scenes",
    href: "scenes",
    icon: Film,
  },
  {
    name: "Share",
    href: "share",
    icon: Share2,
  },
  {
    name: "Settings",
    href: "settings",
    icon: Settings,
  },
];

export default async function ProjectLayout({ children, params }: ProjectLayoutProps) {
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
    <div className="min-h-screen">
      <div className="border-b">
        <div className="container flex h-16 items-center px-4">
          <div className="mr-4">
            <h2 className="text-lg font-semibold">{project.title}</h2>
          </div>
          <nav className="flex items-center space-x-4 lg:space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={`/projects/${params.projectId}/${item.href}`}
                className={cn(
                  "flex items-center text-sm font-medium transition-colors hover:text-primary",
                  "text-muted-foreground"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <div className="container py-6">
        {children}
      </div>
    </div>
  );
} 