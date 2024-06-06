export enum ResponseCode {
  SUCCESS = 'Success',
  FAILURE = 'Failure',
}

export const processResponse = (
  responseCode: ResponseCode,
  message?: string,
  data?: any,
) => {
  let error = true;
  const responseMessage = message || null;

  if (ResponseCode.SUCCESS === responseCode) {
    error = false;
    data = data || null;
  }
  return {
    message: responseMessage,
    error,
    data: data || null,
  };
};
