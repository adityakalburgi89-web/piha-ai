export interface LLMGenerateParams {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
}

export interface ILLMProvider {
  name: string;
  generateText(params: LLMGenerateParams): Promise<string>;
}
