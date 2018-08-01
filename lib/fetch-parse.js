const fetch = require('node-fetch');

const mode = process.env.NODE_ENV || 'development';
const emoji = {
  up: '\u2B06',
  down: '\u2B07',
  error: '\u274C'
};

const shouldLog = mode === 'development' && typeof window !== 'undefined';

function handleResponse(response) {
  if (response.ok) {
    const contentType = response.headers.get('content-type');
    const results =
      response.status === 204
        ? // Always return text here since a 204 shouldn't have a body and .json() will error out on that
          response.text()
        : contentType && ~contentType.indexOf('application/json')
          ? response.json()
          : response.text();

    return results
      .then(res => {
        if (shouldLog) {
          console.log(`${emoji.down} Fetch response: ${response.url}`, res);
        }
        return res;
      })
      .catch(err => {
        if (shouldLog) {
          console.error(`${emoji.error} Fetch error: ${response.url}`, err);
        }
      });
  } else {
    // If we get an error, try to jsonify and return response. If there is
    // an error when doing jsonification, just send text.
    return response
      .json()
      .then(json => ({ response: json, code: response.status }))
      .catch(() => ({ response: response.statusText, code: response.status }))
      .then(results => {
        if (shouldLog) {
          console.error(`${emoji.error} Fetch error: ${response.url}`, results);
        }
        return results;
      })
      .then(results => Promise.reject(results));
  }
}

const fetchParse = function (url, options) {
  if (shouldLog) {
    console.log(`${emoji.up} Fetch request: ${url}`, options);
  }

  return fetch(url, options).then(response => handleResponse(response));
}

module.exports = fetchParse
