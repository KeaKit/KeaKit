/**
 * Tests de Navbar.tsx.
 * Verifica que los ítems de navegación sean correctos para cada rol
 * y que el administrador navegue a AdminIncidents (no MyIncidents).
 *
 * Lee el fichero fuente directamente para validar la configuración
 * sin necesidad de importar el componente React (.tsx).
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const fs: any = require('fs');
const path: any = require('path');

declare const __dirname: string;
const NAVBAR_PATH = path.resolve(__dirname, '../../src/components/Navbar.tsx');
const source = fs.readFileSync(NAVBAR_PATH, 'utf-8');

// ─── Helpers ────────────────────────────────────────────────────────────────

type NavItem = { name: string; icon: string; screen: string };

/**
 * Extrae un array de NavItems del bloque que empieza con `identifier: NavItem[] = [`
 */
function extractNavItems(src: string, identifier: string): NavItem[] {
  const regex = new RegExp(`${identifier}:\\s*NavItem\\[\\]\\s*=\\s*\\[([\\s\\S]*?)\\];`);
  const match = src.match(regex);
  if (!match) throw new Error(`No se encontró el array "${identifier}" en Navbar.tsx`);

  const items: NavItem[] = [];
  const itemRegex = /\{\s*name:\s*'([^']+)',\s*icon:\s*'([^']+)',\s*screen:\s*'([^']+)'\s*\}/g;
  let m: RegExpExecArray | null;
  while ((m = itemRegex.exec(match[1])) !== null) {
    items.push({ name: m[1], icon: m[2], screen: m[3] });
  }
  return items;
}

const adminNavItems = extractNavItems(source, 'adminNavItems');
const userNavItems = extractNavItems(source, 'userNavItems');

// ═══════════════════════════════════════════════════════════════════════════
// Selección de ítems por rol
// ═══════════════════════════════════════════════════════════════════════════

describe('selección de ítems por rol', () => {
  it('usa adminNavItems cuando el rol es ADMIN', () => {
    expect(source).toMatch(/userRole\s*===\s*'ADMIN'\s*\?\s*adminNavItems\s*:\s*userNavItems/);
  });

  it('usa userNavItems cuando el rol es USER', () => {
    expect(source).toMatch(/userRole\s*===\s*'ADMIN'\s*\?\s*adminNavItems\s*:\s*userNavItems/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// adminNavItems
// ═══════════════════════════════════════════════════════════════════════════

describe('adminNavItems', () => {
  it('contiene exactamente 5 ítems', () => {
    expect(adminNavItems).toHaveLength(5);
  });

  it('el ítem de Incidencias navega a AdminIncidents', () => {
    const item = adminNavItems.find(i => i.name === 'Incidencias');
    expect(item).toBeDefined();
    expect(item!.screen).toBe('AdminIncidents');
  });

  it('el ítem de Incidencias NO navega a MyIncidents', () => {
    const item = adminNavItems.find(i => i.name === 'Incidencias');
    expect(item!.screen).not.toBe('MyIncidents');
  });

  it('contiene los ítems esperados con las pantallas correctas', () => {
    const screenMap = adminNavItems.map(i => ({ name: i.name, screen: i.screen }));
    expect(screenMap).toEqual([
      { name: 'Usuarios', screen: 'AdminUsers' },
      { name: 'Categorías', screen: 'Categories' },
      { name: 'Inicio', screen: 'Home' },
      { name: 'Incidencias', screen: 'AdminIncidents' },
      { name: 'Perfil', screen: 'Profile' },
    ]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// userNavItems
// ═══════════════════════════════════════════════════════════════════════════

describe('userNavItems', () => {
  it('contiene exactamente 5 ítems', () => {
    expect(userNavItems).toHaveLength(5);
  });

  it('no contiene un ítem de Incidencias', () => {
    const item = userNavItems.find(i => i.name === 'Incidencias');
    expect(item).toBeUndefined();
  });

  it('no navega a AdminIncidents', () => {
    const screens = userNavItems.map(i => i.screen);
    expect(screens).not.toContain('AdminIncidents');
  });

  it('contiene los ítems esperados con las pantallas correctas', () => {
    const screenMap = userNavItems.map(i => ({ name: i.name, screen: i.screen }));
    expect(screenMap).toEqual([
      { name: 'Artículos', screen: 'MyArticles' },
      { name: 'Servicios', screen: 'MyServices' },
      { name: 'Inicio', screen: 'Home' },
      { name: 'Kits', screen: 'MyKits' },
      { name: 'Perfil', screen: 'Profile' },
    ]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Diferenciación por rol
// ═══════════════════════════════════════════════════════════════════════════

describe('diferenciación de navegación por rol', () => {
  it('ADMIN y USER tienen ítems diferentes', () => {
    expect(adminNavItems).not.toEqual(userNavItems);
  });

  it('ambos roles comparten Inicio y Perfil', () => {
    expect(adminNavItems.find(i => i.name === 'Inicio')?.screen).toBe('Home');
    expect(userNavItems.find(i => i.name === 'Inicio')?.screen).toBe('Home');

    expect(adminNavItems.find(i => i.name === 'Perfil')?.screen).toBe('Profile');
    expect(userNavItems.find(i => i.name === 'Perfil')?.screen).toBe('Profile');
  });
});
