import { NextResponse } from 'next/server';
import { TEMPLATE_REGISTRY } from '@/templates/registry';
import { TemplateDefinition } from '@/templates/types';

export async function GET() {
  try {
    return NextResponse.json({ templates: TEMPLATE_REGISTRY });
  } catch (error: any) {
    return NextResponse.json({ templates: [] });
  }
}

export async function POST(request: Request) {
  try {
    const updatedTemplate: TemplateDefinition = await request.json();

    if (!updatedTemplate || !updatedTemplate.id) {
      return NextResponse.json({ error: 'Invalid template definition' }, { status: 400 });
    }

    // Try saving to disk in local development
    if (process.env.NODE_ENV === 'development') {
      try {
        const fs = await import('fs');
        const path = await import('path');
        const registryPath = path.join(process.cwd(), 'src', 'templates', 'registry.ts');

        if (fs.existsSync(registryPath)) {
          const existingIndex = TEMPLATE_REGISTRY.findIndex((t) => t.id === updatedTemplate.id);
          let newRegistry: TemplateDefinition[];
          if (existingIndex >= 0) {
            newRegistry = [...TEMPLATE_REGISTRY];
            newRegistry[existingIndex] = {
              ...newRegistry[existingIndex],
              ...updatedTemplate,
            };
          } else {
            newRegistry = [...TEMPLATE_REGISTRY, updatedTemplate];
          }

          const newCode = `import { TemplateDefinition } from './types';

export const TEMPLATE_REGISTRY: TemplateDefinition[] = ${JSON.stringify(newRegistry, null, 2)};

export function getTemplateById(id: string): TemplateDefinition {
  return TEMPLATE_REGISTRY.find((t) => t.id === id) || TEMPLATE_REGISTRY[0];
}
`;
          fs.writeFileSync(registryPath, newCode, 'utf8');
        }
      } catch (fsErr) {
        console.warn('Filesystem write skipped in production/serverless:', fsErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Template "${updatedTemplate.name}" mapping updated!`,
      template: updatedTemplate,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to save template mapping' },
      { status: 500 }
    );
  }
}
