import OpenAI, { AzureOpenAI } from 'openai';
import type { H3Event } from 'h3';

interface AIProvider {
  generateCompletion(params: {
    model: string;
    messages: Array<{ role: string; content: string }>;
    maxTokens: number;
    temperature: number;
  }): Promise<string>;
}

class OpenAIProvider implements AIProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
    });
  }

  async generateCompletion(params: {
    model: string;
    messages: Array<{ role: string; content: string }>;
    maxTokens: number;
    temperature: number;
  }): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: params.model,
      messages: params.messages,
      max_completion_tokens: params.maxTokens,
      temperature: params.temperature,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Failed to generate text from OpenAI');
    }
    return content.trim();
  }
}

class AzureOpenAIProvider implements AIProvider {
  private client: AzureOpenAI;
  private deploymentName: string;

  constructor(config: {
    apiKey: string;
    endpoint: string;
    deploymentName: string;
    apiVersion: string;
  }) {
    this.client = new AzureOpenAI({
      apiKey: config.apiKey,
      endpoint: config.endpoint,
      apiVersion: config.apiVersion,
      deployment: config.deploymentName,
    });
    this.deploymentName = config.deploymentName;
  }

  async generateCompletion(params: {
    model: string;
    messages: Array<{ role: string; content: string }>;
    maxTokens: number;
    temperature: number;
  }): Promise<string> {
    // Azure OpenAI uses deployment name instead of model
    const response = await this.client.chat.completions.create({
      model: this.deploymentName,
      messages: params.messages,
      max_completion_tokens: params.maxTokens,
      temperature: params.temperature,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Failed to generate text from Azure OpenAI');
    }
    return content.trim();
  }
}

let aiProvider: AIProvider | null = null;

/**
 * Get AI provider instance based on configuration
 */
export function getAIProvider(event: H3Event): AIProvider {
  if (!aiProvider) {
    const config = useRuntimeConfig(event);
    const provider = config.AI_PROVIDER || 'openai';

    if (provider === 'azure') {
      if (!config.AZURE_OPENAI_API_KEY || !config.AZURE_OPENAI_ENDPOINT || !config.AZURE_OPENAI_DEPLOYMENT_NAME) {
        throw new Error('Azure OpenAI configuration is incomplete. Please set AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, and AZURE_OPENAI_DEPLOYMENT_NAME');
      }

      aiProvider = new AzureOpenAIProvider({
        apiKey: config.AZURE_OPENAI_API_KEY,
        endpoint: config.AZURE_OPENAI_ENDPOINT,
        deploymentName: config.AZURE_OPENAI_DEPLOYMENT_NAME,
        apiVersion: config.AZURE_OPENAI_API_VERSION || '2024-08-01-preview',
      });
    }
    else {
      if (!config.OPENAI_API_KEY) {
        throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY');
      }

      aiProvider = new OpenAIProvider(config.OPENAI_API_KEY);
    }
  }

  return aiProvider;
}

/**
 * Get default model name based on provider
 */
export function getDefaultModel(event: H3Event): string {
  const config = useRuntimeConfig(event);
  const provider = config.AI_PROVIDER || 'openai';

  if (provider === 'azure') {
    // For Azure, we use deployment names directly
    return config.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4.1-mini';
  }

  return 'gpt-4o-mini';
}

/**
 * OpenAI APIを使用してテキストを生成する関数
 * @param event - H3 Event
 * @param systemPrompt - システムプロンプト
 * @param userPrompt - ユーザープロンプト
 * @param options - 生成オプション
 * @returns 生成されたテキスト
 */
export const generateTextWithAI = async (
  event: H3Event,
  systemPrompt: string,
  userPrompt: string,
  options: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  } = {},
): Promise<string> => {
  const {
    model = getDefaultModel(event),
    maxTokens = 500,
    temperature = 1,
  } = options;

  try {
    const provider = getAIProvider(event);

    const generatedText = await provider.generateCompletion({
      model,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      maxTokens,
      temperature,
    });

    return generatedText;
  }
  catch (error) {
    console.error('AI生成エラー:', error);
    throw new Error(`AI生成中にエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
  }
};

/**
 * 参考投稿を含むシステムプロンプトを生成する関数
 * @param referencePosts - 参考投稿の配列
 * @returns システムプロンプト
 */
export const createSystemPromptWithReferences = (referencePosts?: string[]): string => {
  let systemPrompt = `以下の参考投稿の形式を取り入れて、要求に基づいて投稿文を生成してください。`;

  // 参考投稿がある場合はシステムプロンプトに追加
  if (referencePosts && referencePosts.length > 0) {
    systemPrompt += `\n\n参考投稿:\n`;
    referencePosts.forEach((post: string, index: number) => {
      systemPrompt += `\n例${index + 1}: "${post}"\n`;
    });
  }

  return systemPrompt;
};
