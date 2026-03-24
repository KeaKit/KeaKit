/**
 * Extended tests for CU-ARRENDADOR-04 (Gestión de fin de alquiler).
 * Business rules: RN-DEV-01..RN-DEV-13, RN-PAG-13.
 * Focus areas:
 *  - RN-DEV-01: Only owner can confirm return
 *  - RN-DEV-02: Only RENTED articles can be returned
 *  - RN-DEV-04: Guarantee = 20% of pricePerMonth
 *  - RN-DEV-05: GOOD → deposit returned to tenant
 *  - RN-DEV-06: DAMAGED → deposit retained by owner
 *  - RN-DEV-07: Article → AVAILABLE after return
 *  - RN-DEV-08: availableUntil cleared after return
 *  - RN-DEV-09: Only GOOD or DAMAGED accepted
 *  - RN-DEV-10: Owner can indicate damage
 *  - RN-DEV-12: Tenant can confirm item matches description
 *  - RN-PAG-13: Automatic refund on good condition
 */

// ─── Types ──────────────────────────────────────────────────────────────────

type ArticleStatus = 'AVAILABLE' | 'RENTED' | 'INACTIVE';
type ReturnCondition = 'GOOD' | 'DAMAGED';

interface ReturnRequest {
  condition: ReturnCondition;
  comments: string;
}

interface ReturnResponse {
  articleId: number;
  tenantEmail: string;
  resolution: 'DEPOSIT_RETURNED' | 'DEPOSIT_RETAINED';
  amountProcessed: number;
  message: string;
}

interface Article {
  id: number;
  title: string;
  pricePerMonth: number;
  status: ArticleStatus;
  ownerId: number;
  availableUntil: string | null;
}

// ─── Business logic functions (mirror backend) ─────────────────────────────

function validateReturnRequest(request: ReturnRequest): { valid: boolean; error?: string } {
  const validConditions: string[] = ['GOOD', 'DAMAGED'];
  // RN-DEV-09
  if (!validConditions.includes(request.condition)) {
    return { valid: false, error: 'Condición no válida. Usa GOOD o DAMAGED.' };
  }
  return { valid: true };
}

function canProcessReturn(article: Article, requestingUserId: number): { allowed: boolean; reason?: string } {
  // RN-DEV-01
  if (article.ownerId !== requestingUserId) {
    return { allowed: false, reason: 'Solo el propietario puede confirmar la devolución.' };
  }
  // RN-DEV-02
  if (article.status !== 'RENTED') {
    return { allowed: false, reason: 'El artículo no está actualmente alquilado.' };
  }
  return { allowed: true };
}

function calculateGuarantee(pricePerMonth: number): number {
  // RN-DEV-04: 20% of pricePerMonth
  return pricePerMonth * 0.2;
}

function determineResolution(condition: ReturnCondition): 'DEPOSIT_RETURNED' | 'DEPOSIT_RETAINED' {
  // RN-DEV-05 / RN-DEV-06
  return condition === 'GOOD' ? 'DEPOSIT_RETURNED' : 'DEPOSIT_RETAINED';
}

function processReturnResult(article: Article, condition: ReturnCondition): {
  newStatus: ArticleStatus;
  newAvailableUntil: null;
  resolution: 'DEPOSIT_RETURNED' | 'DEPOSIT_RETAINED';
  guaranteeAmount: number;
} {
  return {
    newStatus: 'AVAILABLE',              // RN-DEV-07
    newAvailableUntil: null,             // RN-DEV-08
    resolution: determineResolution(condition),
    guaranteeAmount: calculateGuarantee(article.pricePerMonth),
  };
}

function buildReturnMessage(condition: ReturnCondition, amount: number): string {
  if (condition === 'GOOD') {
    return `Artículo devuelto en buen estado. Se devuelve el 20% de garantía (${amount}€) al arrendatario.`;
  }
  return `Artículo con daños. Se retiene la garantía de ${amount}€ al propietario.`;
}

// ═══════════════════════════════════════════════════════════════════════════
// RN-DEV-01: Only owner can confirm return
// ═══════════════════════════════════════════════════════════════════════════

describe('RN-DEV-01 – Only owner can confirm return', () => {
  const article: Article = {
    id: 1, title: 'Laptop', pricePerMonth: 100, status: 'RENTED', ownerId: 10, availableUntil: '2026-03-01',
  };

  it('allows the owner to process return', () => {
    const result = canProcessReturn(article, 10);
    expect(result.allowed).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('rejects non-owner', () => {
    const result = canProcessReturn(article, 99);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('propietario');
  });

  it('rejects with a different owner id', () => {
    const result = canProcessReturn(article, 11);
    expect(result.allowed).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RN-DEV-02: Only RENTED articles can be returned
// ═══════════════════════════════════════════════════════════════════════════

describe('RN-DEV-02 – Only RENTED articles', () => {
  it('allows return for RENTED article', () => {
    const article: Article = {
      id: 1, title: 'T', pricePerMonth: 50, status: 'RENTED', ownerId: 1, availableUntil: null,
    };
    expect(canProcessReturn(article, 1).allowed).toBe(true);
  });

  it('rejects return for AVAILABLE article', () => {
    const article: Article = {
      id: 1, title: 'T', pricePerMonth: 50, status: 'AVAILABLE', ownerId: 1, availableUntil: null,
    };
    const result = canProcessReturn(article, 1);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('no está actualmente alquilado');
  });

  it('rejects return for INACTIVE article', () => {
    const article: Article = {
      id: 1, title: 'T', pricePerMonth: 50, status: 'INACTIVE', ownerId: 1, availableUntil: null,
    };
    expect(canProcessReturn(article, 1).allowed).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RN-DEV-04: Guarantee = 20% of pricePerMonth
// ═══════════════════════════════════════════════════════════════════════════

describe('RN-DEV-04 – Guarantee calculation', () => {
  it('calculates 20% of 100 as 20', () => {
    expect(calculateGuarantee(100)).toBe(20);
  });

  it('calculates 20% of 50 as 10', () => {
    expect(calculateGuarantee(50)).toBe(10);
  });

  it('calculates 20% of 250.50 correctly', () => {
    expect(calculateGuarantee(250.50)).toBeCloseTo(50.1);
  });

  it('calculates 20% of 0 as 0', () => {
    expect(calculateGuarantee(0)).toBe(0);
  });

  it('handles large price', () => {
    expect(calculateGuarantee(10000)).toBe(2000);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RN-DEV-05 & RN-PAG-13: GOOD → deposit returned
// ═══════════════════════════════════════════════════════════════════════════

describe('RN-DEV-05 / RN-PAG-13 – GOOD condition returns deposit', () => {
  it('resolves to DEPOSIT_RETURNED', () => {
    expect(determineResolution('GOOD')).toBe('DEPOSIT_RETURNED');
  });

  it('full processReturn result for GOOD condition', () => {
    const article: Article = {
      id: 1, title: 'T', pricePerMonth: 100, status: 'RENTED', ownerId: 1, availableUntil: '2026-12-31',
    };
    const result = processReturnResult(article, 'GOOD');
    expect(result.resolution).toBe('DEPOSIT_RETURNED');
    expect(result.guaranteeAmount).toBe(20);
    expect(result.newStatus).toBe('AVAILABLE');
    expect(result.newAvailableUntil).toBeNull();
  });

  it('message for GOOD contains buen estado', () => {
    const msg = buildReturnMessage('GOOD', 20);
    expect(msg).toContain('buen estado');
    expect(msg).toContain('20€');
    expect(msg).toContain('arrendatario');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RN-DEV-06: DAMAGED → deposit retained
// ═══════════════════════════════════════════════════════════════════════════

describe('RN-DEV-06 – DAMAGED condition retains deposit', () => {
  it('resolves to DEPOSIT_RETAINED', () => {
    expect(determineResolution('DAMAGED')).toBe('DEPOSIT_RETAINED');
  });

  it('full processReturn result for DAMAGED condition', () => {
    const article: Article = {
      id: 2, title: 'T', pricePerMonth: 200, status: 'RENTED', ownerId: 1, availableUntil: '2026-06-15',
    };
    const result = processReturnResult(article, 'DAMAGED');
    expect(result.resolution).toBe('DEPOSIT_RETAINED');
    expect(result.guaranteeAmount).toBe(40);
  });

  it('message for DAMAGED contains daños', () => {
    const msg = buildReturnMessage('DAMAGED', 40);
    expect(msg).toContain('daños');
    expect(msg).toContain('40€');
    expect(msg).toContain('propietario');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RN-DEV-07 & RN-DEV-08: Article → AVAILABLE, availableUntil cleared
// ═══════════════════════════════════════════════════════════════════════════

describe('RN-DEV-07 & RN-DEV-08 – Post-return article state', () => {
  it('sets status to AVAILABLE after GOOD', () => {
    const article: Article = {
      id: 1, title: 'T', pricePerMonth: 50, status: 'RENTED', ownerId: 1, availableUntil: '2026-03-01',
    };
    const result = processReturnResult(article, 'GOOD');
    expect(result.newStatus).toBe('AVAILABLE');
  });

  it('sets status to AVAILABLE after DAMAGED', () => {
    const article: Article = {
      id: 1, title: 'T', pricePerMonth: 50, status: 'RENTED', ownerId: 1, availableUntil: '2026-03-01',
    };
    const result = processReturnResult(article, 'DAMAGED');
    expect(result.newStatus).toBe('AVAILABLE');
  });

  it('clears availableUntil after GOOD', () => {
    const article: Article = {
      id: 1, title: 'T', pricePerMonth: 50, status: 'RENTED', ownerId: 1, availableUntil: '2026-12-31',
    };
    const result = processReturnResult(article, 'GOOD');
    expect(result.newAvailableUntil).toBeNull();
  });

  it('clears availableUntil after DAMAGED', () => {
    const article: Article = {
      id: 1, title: 'T', pricePerMonth: 50, status: 'RENTED', ownerId: 1, availableUntil: '2026-05-15',
    };
    const result = processReturnResult(article, 'DAMAGED');
    expect(result.newAvailableUntil).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RN-DEV-09: Only GOOD or DAMAGED accepted
// ═══════════════════════════════════════════════════════════════════════════

describe('RN-DEV-09 – Valid conditions', () => {
  it('GOOD is valid', () => {
    expect(validateReturnRequest({ condition: 'GOOD', comments: '' }).valid).toBe(true);
  });

  it('DAMAGED is valid', () => {
    expect(validateReturnRequest({ condition: 'DAMAGED', comments: '' }).valid).toBe(true);
  });

  it('UNKNOWN is invalid', () => {
    const result = validateReturnRequest({ condition: 'UNKNOWN' as any, comments: '' });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Condición no válida');
  });

  it('empty string is invalid', () => {
    const result = validateReturnRequest({ condition: '' as any, comments: '' });
    expect(result.valid).toBe(false);
  });

  it('GOOD with comments is valid', () => {
    const result = validateReturnRequest({ condition: 'GOOD', comments: 'All perfect' });
    expect(result.valid).toBe(true);
  });

  it('DAMAGED with comments is valid', () => {
    const result = validateReturnRequest({ condition: 'DAMAGED', comments: 'Broken screen' });
    expect(result.valid).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RN-DEV-10: Owner can indicate damage/problems
// ═══════════════════════════════════════════════════════════════════════════

describe('RN-DEV-10 – Owner indicates damage', () => {
  it('owner can set condition to DAMAGED', () => {
    const request: ReturnRequest = { condition: 'DAMAGED', comments: 'Scratched surface' };
    expect(validateReturnRequest(request).valid).toBe(true);

    const article: Article = {
      id: 1, title: 'T', pricePerMonth: 100, status: 'RENTED', ownerId: 1, availableUntil: null,
    };
    const canReturn = canProcessReturn(article, 1);
    expect(canReturn.allowed).toBe(true);

    const result = processReturnResult(article, 'DAMAGED');
    expect(result.resolution).toBe('DEPOSIT_RETAINED');
  });

  it('owner damage report includes guarantee to owner', () => {
    const msg = buildReturnMessage('DAMAGED', 50);
    expect(msg).toContain('propietario');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Combined validation: owner check + status check
// ═══════════════════════════════════════════════════════════════════════════

describe('Combined validation checks', () => {
  it('non-owner on RENTED article: rejected by ownership check', () => {
    const article: Article = {
      id: 1, title: 'T', pricePerMonth: 100, status: 'RENTED', ownerId: 10, availableUntil: null,
    };
    const result = canProcessReturn(article, 99);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('propietario');
  });

  it('owner on non-RENTED article: rejected by status check', () => {
    const article: Article = {
      id: 1, title: 'T', pricePerMonth: 100, status: 'AVAILABLE', ownerId: 10, availableUntil: null,
    };
    const result = canProcessReturn(article, 10);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('no está actualmente alquilado');
  });

  it('owner on RENTED article with valid condition: full flow succeeds', () => {
    const article: Article = {
      id: 5, title: 'Camera', pricePerMonth: 300, status: 'RENTED', ownerId: 10, availableUntil: '2026-08-01',
    };
    expect(canProcessReturn(article, 10).allowed).toBe(true);
    expect(validateReturnRequest({ condition: 'GOOD', comments: '' }).valid).toBe(true);

    const result = processReturnResult(article, 'GOOD');
    expect(result.newStatus).toBe('AVAILABLE');
    expect(result.newAvailableUntil).toBeNull();
    expect(result.resolution).toBe('DEPOSIT_RETURNED');
    expect(result.guaranteeAmount).toBe(60);
  });
});
