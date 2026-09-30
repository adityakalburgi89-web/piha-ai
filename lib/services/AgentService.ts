import { AgentConfig, AgentDomain, AgentLanguageMode, AgentVoiceProvider } from '../core/types/agent';
import { agentRepository, AgentRepository } from '../repositories/agentRepository';
import { ValidationError, NotFoundError } from '../core/errors/AppError';

export interface CreateAgentInput {
  name: string;
  domain: AgentDomain;
  personaName: string;
  voiceProvider?: AgentVoiceProvider;
  voiceId?: string;
  voiceName?: string;
  languageMode?: AgentLanguageMode;
  greeting: string;
  systemPrompt: string;
  dispositionOptions?: string[];
}

export class AgentService {
  private repository: AgentRepository;

  constructor(repository?: AgentRepository) {
    this.repository = repository || agentRepository;
  }

  public async getAllAgents(): Promise<AgentConfig[]> {
    return this.repository.findAll();
  }

  public async getAgentById(id: string): Promise<AgentConfig> {
    const agent = await this.repository.findById(id);
    if (!agent) {
      throw new NotFoundError('Agent', id);
    }
    return agent;
  }

  public async getDefaultAgent(): Promise<AgentConfig> {
    const defaultAgent = await this.repository.findById('agent-ecommerce-neha');
    if (defaultAgent) return defaultAgent;
    const all = await this.repository.findAll();
    return all[0];
  }

  public async createAgent(input: CreateAgentInput): Promise<AgentConfig> {
    if (!input.name || input.name.trim().length === 0) {
      throw new ValidationError('Agent name is required.');
    }
    if (!input.personaName || input.personaName.trim().length === 0) {
      throw new ValidationError('Persona name is required.');
    }
    if (!input.greeting || input.greeting.trim().length === 0) {
      throw new ValidationError('Greeting message is required.');
    }
    if (!input.systemPrompt || input.systemPrompt.trim().length === 0) {
      throw new ValidationError('System prompt is required.');
    }

    const domainSlug = input.domain.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const nameSlug = input.name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20);
    const uniqueId = `agent-${domainSlug}-${nameSlug}-${Date.now().toString(36)}`;

    // Default domain dispositions if not specified
    let defaultDispositions: string[] = ['Hot Lead', 'Warm Lead', 'Cold Lead', 'Callback Requested'];
    if (input.domain === 'real_estate') {
      defaultDispositions = ['Site Visit Booked', 'Budget Qualified (Hot)', 'Just Exploring (Warm)', 'Cold / Not Interested'];
    } else if (input.domain === 'loan_recovery') {
      defaultDispositions = ['Promise to Pay (PTP)', 'Paid Online', 'Dispute Raised', 'Hardship Review', 'Refusal / Disconnect'];
    }

    const now = new Date().toISOString();
    const newAgent: AgentConfig = {
      id: uniqueId,
      name: input.name.trim(),
      domain: input.domain || 'custom',
      personaName: input.personaName.trim(),
      voiceProvider: input.voiceProvider || 'cartesia',
      voiceId: input.voiceId || 'cf061d8b-a752-4865-81a2-57570a6e0565',
      voiceName: input.voiceName || 'Ramya (Bilingual)',
      languageMode: input.languageMode || 'multilingual_auto',
      greeting: input.greeting.trim(),
      systemPrompt: input.systemPrompt.trim(),
      dispositionOptions: input.dispositionOptions && input.dispositionOptions.length > 0 ? input.dispositionOptions : defaultDispositions,
      isPreset: false,
      createdAt: now,
      updatedAt: now,
    };

    return this.repository.create(newAgent);
  }

  public async deleteAgent(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}

const globalForAgentService = globalThis as unknown as {
  agentService?: AgentService;
};

export const agentService =
  globalForAgentService.agentService || new AgentService();

if (process.env.NODE_ENV !== 'production') {
  globalForAgentService.agentService = agentService;
}
