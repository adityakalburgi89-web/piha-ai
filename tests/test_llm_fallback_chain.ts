import { LLMFailoverService } from '@/lib/services/LLMFailoverService';

async function testFallback() {
  const res = await LLMFailoverService.executeWithFallback(
    async () => { throw new Error('Primary LLM timeout'); },
    async () => 'Fallback response success'
  );
  console.log('LLM Fallback test result:', res);
}
testFallback();
