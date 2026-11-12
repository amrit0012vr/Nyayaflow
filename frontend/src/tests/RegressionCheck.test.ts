import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

function scanFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        scanFiles(fullPath, fileList);
      }
    } else if (/\.(tsx|ts|html|css)$/.test(file)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

describe('Portal Brand & Prohibited Phrases Guard (A11Y & GIGW Compliance)', () => {
  const srcDir = path.resolve(__dirname, '..');
  const files = scanFiles(srcDir);

  const prohibitedPhrases = [
    'Change API URL',
    'BAR ENROLLED',
    'BENCH ACCESS',
    'REGISTRY CLEARANCE',
    'LAW ENFORCEMENT ACCESS',
    'immutable'
  ];

  it('contains zero occurrences of prohibited phrases in frontend/src', () => {
    const violations: { file: string; phrase: string }[] = [];

    for (const filePath of files) {
      // Don't flag this test file itself
      if (filePath.includes('RegressionCheck.test.ts')) continue;

      const content = fs.readFileSync(filePath, 'utf-8');
      for (const phrase of prohibitedPhrases) {
        if (content.toLowerCase().includes(phrase.toLowerCase())) {
          violations.push({ file: path.relative(srcDir, filePath), phrase });
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it('ensures prototype disclaimer notice is present in layout templates', () => {
    const enLocalePath = path.join(srcDir, 'locales', 'en.json');
    expect(fs.existsSync(enLocalePath)).toBe(true);
    const content = fs.readFileSync(enLocalePath, 'utf-8');
    expect(content).toContain('Prototype built for the Bharat Agentic-AI Hackathon 2026');

    const noticeBannerPath = path.join(srcDir, 'components', 'layout', 'NoticeBanner.tsx');
    expect(fs.existsSync(noticeBannerPath)).toBe(true);
    const bannerContent = fs.readFileSync(noticeBannerPath, 'utf-8');
    expect(bannerContent).toContain('prototype_notice');
  });
});
