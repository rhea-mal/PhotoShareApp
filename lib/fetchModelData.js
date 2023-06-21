import axios from "axios";
/**
 * fetchModel - Fetch a model from the web server.
 *
 * @param {string} url      The URL to issue the GET request.
 *
 * @returns {Promise} a Promise that should be filled with the response of the GET request
 * parsed as a JSON object and returned in the property named "data" of an
 * object. If the request has an error, the Promise should be rejected with an
 * object that contains the properties:
 * {number} status          The HTTP response status
 * {string} statusText      The statusText from the xhr request
 */

const fetchModelData = (url) => {
  return axios.get(url)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw new Error(`Error fetching model data: ${error.message}`);
    });
};

export default fetchModelData;
