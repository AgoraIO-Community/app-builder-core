import {parseRecordingLayoutResponse} from '../recordingLayoutResponse';

const response = (
  body: string,
  options: {ok?: boolean; status?: number; statusText?: string} = {},
) =>
  ({
    ok: options.ok ?? true,
    status: options.status ?? 200,
    statusText: options.statusText ?? 'OK',
    text: jest.fn().mockResolvedValue(body),
  } as Pick<Response, 'ok' | 'status' | 'statusText' | 'text'>);

describe('parseRecordingLayoutResponse', () => {
  it('accepts an empty successful response', async () => {
    await expect(
      parseRecordingLayoutResponse(
        response('', {status: 204, statusText: 'No Content'}),
      ),
    ).resolves.toBeUndefined();
  });

  it('returns a successful JSON response', async () => {
    await expect(
      parseRecordingLayoutResponse(response('{"success":true}')),
    ).resolves.toEqual({success: true});
  });

  it('rejects an empty HTTP error with status details', async () => {
    await expect(
      parseRecordingLayoutResponse(
        response('', {
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        }),
      ),
    ).rejects.toMatchObject({
      name: 'Error',
      code: 'HTTP_500',
      httpStatus: 500,
      message:
        'Recording layout API failed with HTTP 500 Internal Server Error',
    });
  });

  it('rejects invalid non-empty JSON with the response details', async () => {
    await expect(
      parseRecordingLayoutResponse(response('<html>')),
    ).rejects.toMatchObject({
      name: 'Error',
      code: 'HTTP_200',
      responseBody: '<html>',
    });
  });
});
