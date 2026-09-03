type RecordingLayoutResponse = Pick<
  Response,
  'ok' | 'status' | 'statusText' | 'text'
>;

const createResponseError = (
  message: string,
  response: RecordingLayoutResponse,
  responseBody: string,
) =>
  Object.assign(new Error(message), {
    code: `HTTP_${response.status}`,
    httpStatus: response.status,
    httpStatusText: response.statusText,
    responseBody,
  });

export const parseRecordingLayoutResponse = async (
  response: RecordingLayoutResponse,
): Promise<unknown> => {
  const responseBody = await response.text();
  let responseData: any;

  if (responseBody.trim()) {
    try {
      responseData = JSON.parse(responseBody);
    } catch (error) {
      throw createResponseError(
        `Recording layout API returned invalid JSON: ${
          error instanceof Error ? error.message : String(error)
        }`,
        response,
        responseBody,
      );
    }
  }

  if (!response.ok) {
    const backendMessage =
      responseData?.error?.message ||
      responseData?.error ||
      responseData?.message ||
      responseBody;
    throw createResponseError(
      `Recording layout API failed with HTTP ${response.status}${
        response.statusText ? ` ${response.statusText}` : ''
      }${backendMessage ? `: ${String(backendMessage)}` : ''}`,
      response,
      responseBody,
    );
  }

  if (responseData?.error) {
    const backendMessage =
      responseData.error?.message ||
      (typeof responseData.error === 'string'
        ? responseData.error
        : JSON.stringify(responseData.error));
    throw createResponseError(
      `Recording layout API returned an error: ${backendMessage}`,
      response,
      responseBody,
    );
  }

  return responseData;
};
