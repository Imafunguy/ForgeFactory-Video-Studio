/**
 * Premium preset regression runner — scores all 5 presets on expanded Ultimate rubric.
 * Usage: npm run test:premium
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  runPresetRegression,
  runStrataBody30sTest,
  runPresetTest,
} from '../src/lib/premiumTestingHarness';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const date = new Date().toISOString().slice(0, 10);
const logPath = join(root, 'research', `test-log-${date}.md`);

const report = runPresetRegression();
const strata = runStrataBody30sTest();
const higgsfield = runPresetTest('higgsfield-cinematic');

let md = report.logMarkdown;
md += '\n## StrataBody 30s Focus Test\n\n';
md += `- **Preset:** ${strata.label}\n`;
md += `- **Overall:** ${strata.overallScore}/10 (${strata.overallPass ? 'PASS' : 'FAIL'})\n`;
md += `- **Gate pass rate:** ${strata.gatePassRate}%\n`;
md += `- **Premium feel tags:** ${strata.premiumFeelTags.join(', ')}\n`;
md += `- **Motion brush areas:** ${strata.controls.motionBrush.areas.length}\n`;
md += `- **Ref lock:** ${strata.controls.refConsistencyStrength}%\n`;
md += `- **Variants:** ${strata.controls.variantCount} (${strata.controls.variantStrategy})\n`;
md += `- **Node graph:** ${strata.controls.nodeGraph.enabled ? strata.controls.nodeGraph.templateName : 'off'}\n`;
md += '\n### Category breakdown (Higgsfield cinematic)\n\n';
for (const c of higgsfield.categories) {
  md += `- ${c.label}: **${c.score}**/10 ${c.pass ? '✓' : '✗'}\n`;
}

writeFileSync(logPath, md, 'utf8');

console.log(md);
console.log(`\nLogged to ${logPath}`);
console.log(`Regression guard: ${report.regressionOk ? 'PASS' : 'FAIL'}`);
console.log(`Average score: ${report.averageScore}/10`);

const failed = report.results.filter((r) => !r.overallPass);
if (failed.length > 0) {
  console.error(`\n${failed.length} preset(s) below threshold:`);
  failed.forEach((r) => console.error(`  - ${r.label}: ${r.overallScore}/10`));
  process.exit(1);
}

process.exit(0);