import { agentService } from '@/lib/services/AgentService';
import { analyticsService } from '@/lib/services/AnalyticsService';
import { callManagementService } from '@/lib/services/CallManagementService';
import { LLMFailoverService } from '@/lib/services/LLMFailoverService';
import { dateTimeResolver } from '@/lib/services/DateTimeResolver';

async function runTests() {
  console.log('====================================================');
  console.log(' RUNNING ELEVATEVOICE INTEGRATION TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Verify Built-in Presets
  console.log('1. Checking Voice Assistant Presets...');
  const presets = await agentService.getAllAgents();
  assert(presets.length >= 3, `Expected at least 3 presets, found ${presets.length}`);
  const neha = presets.find((a) => a.id === 'agent-ecommerce-neha');
  const rahul = presets.find((a) => a.id === 'agent-realestate-rahul');
  const priya = presets.find((a) => a.id === 'agent-loanrecovery-priya');
  assert(Boolean(neha), 'Preset "Neha (E-Commerce)" exists');
  assert(Boolean(rahul), 'Preset "Rahul (Real Estate)" exists');
  assert(Boolean(priya), 'Preset "Priya (Loan Recovery)" exists');

  // 2. Create a Custom Agent
  console.log('\n2. Testing Custom Assistant Creation...');
  const customAgent = await agentService.createAgent({
    name: 'Bangalore Luxury Penthouses Advisor',
    domain: 'real_estate',
    personaName: 'Kavya',
    voiceProvider: 'cartesia',
    greeting: 'Namaste! Kavya from Luxury Penthouses here. Are you looking for 4BHK or Penthouse?',
    systemPrompt: 'You are Kavya, an advisor for high-net-worth real estate buyers in Bangalore.',
  });
  assert(Boolean(customAgent && customAgent.id), `Custom agent created with ID: ${customAgent.id}`);
  assert(customAgent.personaName === 'Kavya', 'Persona name matches');
  assert(customAgent.domain === 'real_estate', 'Domain matches real_estate');

  // 3. Retrieve Custom Agent
  console.log('\n3. Testing Assistant Retrieval...');
  const fetched = await agentService.getAgentById(customAgent.id);
  assert(fetched.name === 'Bangalore Luxury Penthouses Advisor', 'Fetched agent matches created name');

  // 4. Test Outbound Call with Custom Agent ID
  console.log('\n4. Testing Outbound Call Initiation with Agent ID...');
  const callResult = await callManagementService.initiateOutboundCall({
    phoneNumber: '+919876543210',
    agentId: customAgent.id,
  });
  assert(Boolean(callResult && callResult.callId), `Call initiated with Call ID: ${callResult.callId}`);

  const callState = await callManagementService.getCallState(callResult.callId);
  assert(callState.agentId === customAgent.id, `Call state recorded agentId: ${callState.agentId}`);
  assert(callState.phoneNumber === '+919876543210', 'Phone number matches input');

  // Transition call to connected with duration to verify dynamic analytics calculation
  await callManagementService.updateCallStatus(callResult.callId, 'connected');
  const connectedState = await callManagementService.getCallState(callResult.callId);
  connectedState.durationSeconds = 120;
  connectedState.classification = 'HOT';
  await (callManagementService as any).repository.update(connectedState);

  // 5. Test Analytics Aggregations
  console.log('\n5. Testing Analytics Metrics Service...');
  const analytics = await analyticsService.getAnalytics();
  assert(analytics.summary.totalCalls > 0, `Total calls recorded: ${analytics.summary.totalCalls}`);
  assert(analytics.summary.connectedCalls > 0, `Connected calls recorded: ${analytics.summary.connectedCalls}`);
  assert(analytics.summary.pickupRatePct >= 0 && analytics.summary.pickupRatePct <= 100, `Pickup rate is valid: ${analytics.summary.pickupRatePct}%`);
  assert(Boolean(analytics.summary.acdFormatted), `ACD formatted string: ${analytics.summary.acdFormatted}`);
  assert(analytics.dispositionBreakdown.length > 0, `Dispositions breakdown count: ${analytics.dispositionBreakdown.length}`);
  assert(analytics.agentMetrics.length >= 3, `Agent performance fleet count: ${analytics.agentMetrics.length}`);
  assert(analytics.recentCalls.length > 0, `Recent call session explorer count: ${analytics.recentCalls.length}`);

  // 6. Delete Custom Agent
  console.log('\n6. Testing Agent Deletion...');
  const deleted = await agentService.deleteAgent(customAgent.id);
  assert(deleted === true, 'Custom agent deleted successfully');

  // Verify preset cannot be deleted
  try {
    await agentService.deleteAgent('agent-ecommerce-neha');
    assert(false, 'Expected preset deletion to fail');
  } catch {
    assert(true, 'Preset agent deletion correctly rejected with security guard');
  }

  // 7. Test Failover and DateTime Resolution
  console.log('\n7. Testing LLM Failover & Temporal Resolver...');
  const failoverRes = await LLMFailoverService.executeWithFallback(
    async () => { throw new Error('Primary timeout'); },
    async () => 'Fallback engine OK'
  );
  assert(failoverRes === 'Fallback engine OK', 'LLM failover executes secondary function on failure');

  const dtRes = dateTimeResolver.resolve('tomorrow at 4pm', new Date('2026-09-15T00:00:00Z'));
  assert(dtRes.resolved === true, 'IST parser resolves "tomorrow at 4pm"');

  console.log('\n====================================================');
  console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal error in test suite:', err);
  process.exit(1);
});
