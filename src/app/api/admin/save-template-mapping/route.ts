import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { TemplateDefinition } from '@/templates/types';

const registryPath = path.join(process.cwd(), 'src', 'templates', 'registry.ts');

function readCurrentRegistry(): TemplateDefinition[] {
  if (!fs.existsSync(registryPath)) return [];
  const content = fs.readFileSync(registryPath, 'utf8');
  const match = content.match(/TEMPLATE_REGISTRY:\s*TemplateDefinition\[\]\s*=\s*(\[[\s\S]*?\]);\s*export function/);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1]);
    } catch {
      // fallback
    }
  }
  return [];
}

export async function GET() {
  const current = readCurrentRegistry();
  return NextResponse.json({ templates: current });
}

export async function POST(request: Request) {
  try {
    const updatedTemplate: TemplateDefinition = await request.json();

    if (!updatedTemplate || !updatedTemplate.id) {
      return NextResponse.json({ error: 'Invalid template definition' }, { status: 400 });
    }

    let currentRegistry = readCurrentRegistry();
    if (!currentRegistry.length) {
      const { TEMPLATE_REGISTRY } = await import('@/templates/registry');
      currentRegistry = [...TEMPLATE_REGISTRY];
    }

    const existingIndex = currentRegistry.findIndex((t) => t.id === updatedTemplate.id);

    let newRegistry: TemplateDefinition[];
    if (existingIndex >= 0) {
      newRegistry = [...currentRegistry];
      newRegistry[existingIndex] = {
        ...newRegistry[existingIndex],
        ...updatedTemplate,
      };
    } else {
      newRegistry = [...currentRegistry, updatedTemplate];
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
      templates: newRegistry,
    });
  } catch (error: any) {
    console.error('Error saving template mapping:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save template mapping' },
      { status: 500 }
    );
  }
}
