import createError from 'http-errors';

export default function handleError(statusCode) {
  const error =  new createError(statusCode)
  error.statusCode  = statusCode;
  throw error;
}