/**
 * Tests de HeaderNavbar.tsx.
 * Verifica que los ítems de navegación del header sean correctos para cada rol
 * y que el administrador navegue a AdminIncidents (no MyIncidents).
 *
 * Lee el fichero fuente directamente para validar la configuración
 * sin necesidad de importar el componente React (.tsx).
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const fs: any = require('fs');
const path: any = require('path');

declare const __dirname: string;
const HEADER_NAVBAR_PATH = path.resolve(__dirname, '../../src/components/HeaderNavbar.tsx');
const source: string = fs.readFileSync(HEADER_NAVBAR_PATH, 'utf-8');

// ─── Helpers ────────────────────────────────────────────────────────────────

type HeaderNavItem = { name: string; icon: string; screen: string; flag: string };

/**
 * Extrae un array de NavbarHeaderItems del bloque que empieza con `identifier: NavbarHeaderItem[] = [`
 */
function extractHeaderNavItems(src: string, identifier: string): HeaderNavItem[] {
  const regex = new RegExp(`${identifier}:\\s*NavbarHeaderItem\\[\\]\\s*=\\s*\\[([\\s\\S]*?)\\];`);
  const match = src.match(regex);
  if (!match) throw new Error(`No se encontró el array "${identifier}" en HeaderNavbar.tsx`);

  const items: HeaderNavItem[] = [];
  const itemRegex = /\{\s*name:\s*'([^']+)',\s*icon:\s*'([^']+)',\s*screen:\s*'([^']+)',\s*(requiresAuth|requiresAdmin):\s*true\s*\}/g;
  let m: RegExpExecArray | null;
  while ((m = itemRegex.exec(match[1])) !== null) {
    items.push({ name: m[1], icon: m[2], screen: m[3], flag: m[4] });
  }
  return items;
}

const adminNavItems = extractHeaderNavItems(source, 'adminNavItems');
const userNavItems = extractHeaderNavItems(source, 'userNavItems');

// ═══════════════════════════════════════════════════════════════════════════
// Selección de ítems por rol
// ═══════════════════════════════════════════════════════════════════════════

describe('selección de ítems por rol en HeaderNavbar', () => {
  it('usa adminNavItems cuando el rol es ADMIN', () => {
    expect(source).toMatch(/user\.role\s*===\s*'ADMIN'/);
  });

  it('filtra adminNavItems para usuarios ADMIN', () => {
    expect(source).toMatch(/return adminNavItems\.filter/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// adminNavItems
// ═══════════════════════════════════════════════════════════════════════════

describe('adminNavItems (HeaderNavbar)', () => {
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

  it('todos los ítems tienen requiresAdmin', () => {
    adminNavItems.forEach(item => {
      expect(item.flag).toBe('requiresAdmin');
    });
  });

  it('contiene los ítems esperados con las pantallas correctas', () => {
    const screenMap = adminNavItems.map(i => ({ name: i.name, screen: i.screen }));
    expect(screenMap).toEqual([
      { name: 'Usuarios', screen: 'AdminUsers' },
      { name: 'Categorías', screen: 'Categories' },
      { name: 'Comisión de Plataforma', screen: 'Commission' },
      { name: 'Incidencias', screen: 'AdminIncidents' },
      { name: 'Kits Predeterminados', screen: 'DefaultKits' },
    ]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// userNavItems
// ═══════════════════════════════════════════════════════════════════════════

describe('userNavItems (HeaderNavbar)', () => {
  it('contiene exactamente 4 ítems', () => {
    expect(userNavItems).toHaveLength(4);
  });

  it('el ítem de Incidencias navega a MyIncidents', () => {
    const item = userNavItems.find(i => i.name === 'Incidencias');
    expect(item).toBeDefined();
    expect(item!.screen).toBe('MyIncidents');
  });

  it('no navega a AdminIncidents', () => {
    const screens = userNavItems.map(i => i.screen);
    expect(screens).not.toContain('AdminIncidents');
  });

  it('todos los ítems tienen requiresAuth', () => {
    userNavItems.forEach(item => {
      expect(item.flag).toBe('requiresAuth');
    });
  });

  it('contiene los ítems esperados con las pantallas correctas', () => {
    const screenMap = userNavItems.map(i => ({ name: i.name, screen: i.screen }));
    expect(screenMap).toEqual([
      { name: 'Artículos', screen: 'MyArticles' },
      { name: 'Kits', screen: 'MyKits' },
      { name: 'Servicios', screen: 'MyServices' },
      { name: 'Incidencias', screen: 'MyIncidents' },
    ]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Diferenciación por rol
// ═══════════════════════════════════════════════════════════════════════════

describe('diferenciación de navegación por rol (HeaderNavbar)', () => {
  it('ADMIN y USER tienen ítems diferentes', () => {
    expect(adminNavItems).not.toEqual(userNavItems);
  });

  it('admin Incidencias apunta a AdminIncidents, user Incidencias apunta a MyIncidents', () => {
    const adminInc = adminNavItems.find(i => i.name === 'Incidencias');
    const userInc = userNavItems.find(i => i.name === 'Incidencias');
    expect(adminInc!.screen).toBe('AdminIncidents');
    expect(userInc!.screen).toBe('MyIncidents');
  });
});
