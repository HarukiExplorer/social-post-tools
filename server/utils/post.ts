import type { GeneratePostRequestBody, GeneratePostResponse } from '~~/shared/types/api/generatePost';
import { generateTextWithAI, createSystemPromptWithReferences, getDefaultModel } from './ai';
import type { H3Event } from 'h3';

/**
 * ソーシャルメディア投稿を生成する関数
 * @param event - H3 Event
 * @param requestBody - 要求内容と参考投稿が含まれるリクエストボディ
 * @returns 生成された投稿内容
 */
export const generatePost = async (event: H3Event, requestBody: GeneratePostRequestBody): Promise<GeneratePostResponse> => {
  const { requirements, referencePosts } = requestBody;

  try {
    // システムプロンプトの作成
    const systemPrompt = createSystemPromptWithReferences(referencePosts);

    // ユーザープロンプトの作成
    const userPrompt = `以下の要求に基づいて投稿文を生成してください:\n\n${requirements}`;

    // AI APIでの投稿生成
    const generatedPost = await generateTextWithAI(event, systemPrompt, userPrompt, {
      model: getDefaultModel(event),
      maxTokens: 4000,
    });

    return {
      post: generatedPost,
    };
  }
  catch (error) {
    console.error('generatePost エラー:', error);
    throw new Error(`投稿生成中にエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
  }
};
