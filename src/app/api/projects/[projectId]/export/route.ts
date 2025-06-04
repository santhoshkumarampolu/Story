import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { projectId } = await params;
    const { format } = await req.json();

    // Fetch project with all related data
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId: session.user.id,
      },
      include: {
        characters: true,
        scenes: {
          orderBy: {
            order: "asc",
          },
        },
        cards: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    let exportData: string;
    let contentType: string;
    let filename: string;

    switch (format) {
      case "pdf":
        // TODO: Implement PDF export
        throw new Error("PDF export not implemented yet");
      
      case "markdown":
        exportData = generateMarkdown(project);
        contentType = "text/markdown";
        filename = `${project.title.toLowerCase().replace(/\s+/g, "-")}.md`;
        break;
      
      case "json":
        exportData = JSON.stringify(project, null, 2);
        contentType = "application/json";
        filename = `${project.title.toLowerCase().replace(/\s+/g, "-")}.json`;
        break;
      
      default:
        throw new Error("Unsupported export format");
    }

    // Create response with file
    const response = new NextResponse(exportData);
    response.headers.set("Content-Type", contentType);
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    return response;
  } catch (error) {
    console.error("[EXPORT] Error:", error);
    return NextResponse.json(
      { error: "Failed to export project" },
      { status: 500 }
    );
  }
}

function generateMarkdown(project: any): string {
  let markdown = `# ${project.title}\n\n`;

  if (project.description) {
    markdown += `${project.description}\n\n`;
  }

  if (project.logline) {
    markdown += `## Logline\n${project.logline}\n\n`;
  }

  if (project.characters.length > 0) {
    markdown += `## Characters\n\n`;
    project.characters.forEach((character: any) => {
      markdown += `### ${character.name}\n${character.description}\n\n`;
    });
  }

  if (project.scenes.length > 0) {
    markdown += `## Scenes\n\n`;
    project.scenes.forEach((scene: any) => {
      markdown += `### ${scene.title}\n\n`;
      if (scene.summary) {
        markdown += `**Summary:** ${scene.summary}\n\n`;
      }
      if (scene.script) {
        markdown += `**Script:**\n\`\`\`\n${scene.script}\n\`\`\`\n\n`;
      }
    });
  }

  if (project.cards.length > 0) {
    markdown += `## Story Cards\n\n`;
    project.cards.forEach((card: any) => {
      markdown += `### ${card.type}\n${card.content}\n\n`;
    });
  }

  return markdown;
} 