const jsonResponse = (statusCode, body) => {
  return {
    statusCode,
    body,
  };
};

export default jsonResponse;
