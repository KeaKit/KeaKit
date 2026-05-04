import { formatOwnerCommissionPromoBadgeLabel } from '../../src/utils/ownerCommissionPromo';

/* eslint-disable @typescript-eslint/no-var-requires */
const fs: any = require('fs');
const path: any = require('path');

declare const __dirname: string;

const screenPath = path.resolve(__dirname, '../../src/screens/profile/MyArticlesScreen.tsx');
const uploadArticleScreenPath = path.resolve(__dirname, '../../src/screens/profile/UploadArticleScreen.tsx');
const typesPath = path.resolve(__dirname, '../../src/types/index.ts');
const articleServicePath = path.resolve(__dirname, '../../src/services/articleService.ts');

const screenSource = fs.readFileSync(screenPath, 'utf-8');
const uploadArticleScreenSource = fs.readFileSync(uploadArticleScreenPath, 'utf-8');
const typesSource = fs.readFileSync(typesPath, 'utf-8');
const articleServiceSource = fs.readFileSync(articleServicePath, 'utf-8');

describe('MyArticles owner commission promo badge', () => {
  it('formatea el badge como descuento de comisión para evitar ambigüedad', () => {
    expect(formatOwnerCommissionPromoBadgeLabel('OWNERPILOT10')).toBe('Descuento comisión: OWNERPILOT10');
  });

  it('normaliza espacios del código antes de mostrarlo', () => {
    expect(formatOwnerCommissionPromoBadgeLabel('  OWNERPILOT10  ')).toBe('Descuento comisión: OWNERPILOT10');
  });

  it('no renderiza label cuando no hay código', () => {
    expect(formatOwnerCommissionPromoBadgeLabel(null)).toBeNull();
    expect(formatOwnerCommissionPromoBadgeLabel(undefined)).toBeNull();
    expect(formatOwnerCommissionPromoBadgeLabel('   ')).toBeNull();
  });

  it('el tipo UserArticle acepta ownerCommissionPromoCode desde my-articles', () => {
    expect(typesSource).toContain('export interface UserArticle');
    expect(typesSource).toContain('ownerCommissionPromoCode?: string | null');
  });

  it('getMyArticles tipa la respuesta como UserArticle[]', () => {
    expect(articleServiceSource).toContain('UserArticle');
    expect(articleServiceSource).toContain('): Promise<UserArticle[]>');
    expect(articleServiceSource).toContain('return handleResponse<UserArticle[]>(res)');
  });

  it('MyArticlesScreen renderiza un badge accesible solo cuando existe ownerCommissionPromoCode', () => {
    expect(screenSource).toContain('formatOwnerCommissionPromoBadgeLabel(item.ownerCommissionPromoCode)');
    expect(screenSource).toContain('ownerPromoBadgeLabel ?');
    expect(screenSource).toContain('testID={`owner-promo-badge-${item.id}`}');
    expect(screenSource).toContain('accessibilityLabel={ownerPromoBadgeLabel}');
    expect(screenSource).toContain('{ownerPromoBadgeLabel}');
  });

  it('UploadArticleScreen valida el promo como descuento de comisión de arrendador', () => {
    expect(uploadArticleScreenSource).toContain('validatePromoCode');
    expect(uploadArticleScreenSource).toContain("'OWNER_COMMISSION_REDUCTION'");
  });

  it('UploadArticleScreen envía ownerCommissionPromoCode en el payload solo tras aplicar el código', () => {
    expect(uploadArticleScreenSource).toContain('appliedOwnerPromoCode');
    expect(uploadArticleScreenSource).toContain('ownerCommissionPromoCode: appliedOwnerPromoCode');
  });
});
