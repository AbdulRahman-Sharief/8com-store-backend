interface SanitizableBody {
  [key: string]: any;
}

export const sanitizeBody = (body: SanitizableBody): SanitizableBody => {
  return Object.keys(body)
    .filter(
      (key) =>
        body[key] !== undefined && body[key] !== null && body[key] !== '',
    )
    .reduce((obj, key) => {
      obj[key] = body[key];
      return obj;
    }, {});
};
