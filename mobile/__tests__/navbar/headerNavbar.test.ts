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

let adminNavItems: HeaderNavItem[] = [];
let userNavItems: HeaderNavItem[] = [];
/**
 * Extrae ambos arrays de navegación (adminNavItems y userNavItems) del código fuente de HeaderNavbar.tsx
 * @param src Código fuente de HeaderNavbar.tsx como string
 * @returns Objeto { adminNavItems: HeaderNavItem[], userNavItems: HeaderNavItem[] }
 */
function extractNavItems(src: string): { adminNavItems: HeaderNavItem[], userNavItems: HeaderNavItem[] } {
  const items: { adminNavItems: HeaderNavItem[], userNavItems: HeaderNavItem[] } = { 
    adminNavItems: [] as HeaderNavItem[], 
    userNavItems: [] as HeaderNavItem[] 
  };

  const arrayRegex = /const\s+(adminNavItems|userNavItems):\s*NavbarHeaderItem\[\]\s*=\s*\[([\s\S]*?)\];/g;
  let arrayMatch;

  while ((arrayMatch = arrayRegex.exec(src)) !== null) {
    const arrayName = arrayMatch[1];
    const arrayContent = arrayMatch[2];

    const itemRegex = /\{\s*name:\s*["']([^"']+)["'][,\s]*icon:\s*["']([^"']+)["'][,\s]*screen:\s*["']([^"']+)["'][,\s]*(requiresAuth|requiresAdmin):\s*true\s*[,\s]*\}/gs;
    
    let itemMatch;
    while ((itemMatch = itemRegex.exec(arrayContent)) !== null) {
      const item: HeaderNavItem = {
        name: itemMatch[1],
        icon: itemMatch[2],
        screen: itemMatch[3],
        flag: itemMatch[4]
      };

      if (arrayName === 'adminNavItems') {
        items.adminNavItems.push(item);
      } else if (arrayName === 'userNavItems') {
        items.userNavItems.push(item);
      }
    }
  }

  return items;
}

beforeAll(() => {
  const extracted = extractNavItems(source);
  expect(extracted.adminNavItems).toBeDefined();
  expect(extracted.userNavItems).toBeDefined();
  adminNavItems = extracted.adminNavItems;
  userNavItems = extracted.userNavItems;
  expect(adminNavItems.length).toBe(5);
  expect(userNavItems.length).toBe(4);
}
);

// ═══════════════════════════════════════════════════════════════════════════
// Extracción de datos del código fuente
// ═══════════════════════════════════════════════════════════════════════════

describe('extracción de adminNavItems y userNavItems de HeaderNavbar.tsx', () => {
  it('extrae adminNavItems correctamente', () => {
    expect(adminNavItems).toHaveLength(5);
  });
  
  it('extrae userNavItems correctamente', () => {
    expect(userNavItems).toHaveLength(4);
  });
});


// ═══════════════════════════════════════════════════════════════════════════
// Selección de ítems por rol
// ═══════════════════════════════════════════════════════════════════════════

describe('selección de ítems por rol en HeaderNavbar', () => {
  it('usa adminNavItems cuando el rol es ADMIN', () => {
    expect(source).toMatch(/user\.role\s*===\s*["']ADMIN["']/);
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
