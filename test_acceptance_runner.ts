import { ACCEPTANCE_SCENARIOS, runAcceptanceScenario } from './src/engine/scenarios';

async function main() {
  console.log('Running all 28 Acceptance Scenarios (G01 to G28), both harmful and control...');
  let total = 0;
  let passed = 0;
  let failed = 0;

  for (const scen of ACCEPTANCE_SCENARIOS) {
    total += 2;
    const h = await runAcceptanceScenario(scen, 'harmful');
    if (h.passed) {
      passed++;
      console.log(`✓ [PASS] ${scen.id} Harmful: ${h.actualStatus} (Expected: ${scen.harmfulCase.expectedDecision})`);
    } else {
      failed++;
      console.error(`✗ [FAIL] ${scen.id} Harmful: got ${h.actualStatus}, expected ${scen.harmfulCase.expectedDecision}. Reasons:`, h.reasons);
    }

    const c = await runAcceptanceScenario(scen, 'control');
    if (c.passed) {
      passed++;
      console.log(`✓ [PASS] ${scen.id} Control: ${c.actualStatus} (Expected: ${scen.controlCase.expectedDecision})`);
    } else {
      failed++;
      console.error(`✗ [FAIL] ${scen.id} Control: got ${c.actualStatus}, expected ${scen.controlCase.expectedDecision}. Reasons:`, c.reasons);
    }
  }

  console.log('\n========================================');
  console.log(`TOTAL ACCEPTANCE TESTS: ${passed}/${total} PASSED (${failed} FAILED)`);
  console.log('========================================');

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
