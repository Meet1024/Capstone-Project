/**
 * @desc    This file contain Success and Error response for sending to client / user
 **/

/**
 * @desc    Send any success response
 *
 * @param   {string} message
 * @param   {object | array} results
 * @param   {number} statusCode
 */
exports.success = (message, results, statusCode) => {
  return {
    message,
    error: false,
    code: statusCode,
    results,
    errors: null,
  };
};

/**
 * @desc    Send any error response
 *
 * @param   {string} message
 * @param   {number} statusCode
 */
exports.serverError = (message, errors, statusCode) => {
  // List of common HTTP request code
  const codes = [200, 201, 400, 401, 404, 403, 422, 500];

  // Get matched code
  const findCode = codes.find((code) => code == statusCode);

  if (!findCode) statusCode = 500;
  else statusCode = findCode;

  return {
    message,
    code: statusCode,
    error: true,
    errors,
  };
};

/**
 * @desc    Send any validation response
 *
 * @param   {object | array} errors
 */
exports.validation = (errors) => {
  return {
    message: "Please Enter Valid Data",
    error: true,
    code: 400,
    errors: { message: errors },
  };
};

/**
 * @desc    Send any Authorization response
 *
 * @param   {object | array} errors
 */
exports.unAuthorized = (errors) => {
  return {
    message: "Invalid Credentials",
    error: true,
    code: 401,
    errors: { message: errors },
  };
};
