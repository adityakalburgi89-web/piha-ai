import { AgentConfig, AGENT_PRESETS } from '../core/types/agent';
import { databaseService } from '../services/DatabaseService';

export class AgentRepository {
  private agents = new Map<string, AgentConfig>();
  private initializedFromDb = false;

  constructor() {
    // Seed default production presets into in-memory store
    for (const preset of AGENT_PRESETS) {
      this.agents.set(preset.id, { ...preset });
    }
  }

  private async syncFromDatabase(): Promise<void> {
    if (!databaseService.isAvailable()) return;

    try {
      const dbAgents = await databaseService.getAllAgents();
      if (dbAgents && dbAgents.length > 0) {
        for (const ag of dbAgents) {
          this.agents.set(ag.id, ag);
        }
      }
      this.initializedFromDb = true;
    } catch {
      // Fallback silently to in-memory presets
    }
  }

  public async findAll(): Promise<AgentConfig[]> {
    if (!this.initializedFromDb && databaseService.isAvailable()) {
      await this.syncFromDatabase();
    }
    return Array.from(this.agents.values());
  }

  public async findById(id: string): Promise<AgentConfig | null> {
    if (!this.initializedFromDb && databaseService.isAvailable()) {
      await this.syncFromDatabase();
    }
    return this.agents.get(id) || null;
  }

  public async create(agent: AgentConfig): Promise<AgentConfig> {
    this.agents.set(agent.id, agent);
    if (databaseService.isAvailable()) {
      await databaseService.saveAgent(agent);
    }
    return agent;
  }

  public async update(agent: AgentConfig): Promise<AgentConfig> {
    agent.updatedAt = new Date().toISOString();
    this.agents.set(agent.id, agent);
    if (databaseService.isAvailable()) {
      await databaseService.saveAgent(agent);
    }
    return agent;
  }

  public async delete(id: string): Promise<boolean> {
    const existing = this.agents.get(id);
    if (existing && existing.isPreset) {
      // Do not allow deleting built-in production presets
      throw new Error(`Cannot delete built-in system preset agent: ${existing.name}`);
    }
    const deleted = this.agents.delete(id);
    if (deleted && databaseService.isAvailable()) {
      await databaseService.deleteAgent(id);
    }
    return deleted;
  }
}

const globalForAgentRepo = globalThis as unknown as {
  agentRepository?: AgentRepository;
};

export const agentRepository =
  globalForAgentRepo.agentRepository || new AgentRepository();

if (process.env.NODE_ENV !== 'production') {
  globalForAgentRepo.agentRepository = agentRepository;
}
