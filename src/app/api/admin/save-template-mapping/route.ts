import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { TemplateDefinition } from '@/templates/types';

export async function POST(request: Request) {
  try {
    const updatedTemplate: TemplateDefinition = await request.json();

    if (!updatedTemplate || !updatedTemplate.id) {
      return NextResponse.json({ error: 'Invalid template definition' }, { status: 400 });
    }

    const registryPath = path.join(process.cwd(), 'src', 'templates', 'registry.ts');

    if (!fs.existsSync(registryPath)) {
      return NextResponse.json({ error: 'registry.ts not found' }, { status: 404 });
    }

    // Read current registry file
    const fileContent = fs.readFileSync(registryPath, 'utf8');

    // Dynamically update the specific template definition
    const { TEMPLATE_REGISTRY } = await import('@/templates/registry');
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

    // Write back formatted TypeScript code to registry.ts
    const newCode = `import { TemplateDefinition } from './types';

export const TEMPLATE_REGISTRY: TemplateDefinition[] = ${JSON.stringify(newRegistry, null, 2)};

export function getTemplateById(id: string): TemplateDefinition {
  return TEMPLATE_REGISTRY.find((t) => t.id === id) || TEMPLATE_REGISTRY[0];
}
`;

    fs.writeFileSync(registryPath, newCode, 'utf8');

    return NextResponse.json({
      success: true,
      message: `Template "${updatedTemplate.name}" mapping saved permanently!`,
      template: updatedTemplate,
    });
  } catch (error: any) {
    console.error('Error saving template mapping:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save template mapping' },
      { status: 500 }
    );
  }
}
