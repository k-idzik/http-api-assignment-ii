// Node's built-in cryptography module.
const crypto = require('crypto');

// This object is purely in memory
const users = {};

// SHA-1 is a bit of a quicker hash algorithm for insecure things
let etag = crypto.createHash('sha1').update(JSON.stringify(users));
// Grab the hash as a hex string
let digest = etag.digest('hex');

// Responding to GET
const respondJSON = (request, response, status, object) => {
  const headers = {
    'Content-Type': 'application/json',
    etag: digest,
  };

  response.writeHead(status, headers);
  response.write(JSON.stringify(object));
  response.end();
};

// Responding to HEAD
const respondJSONHead = (request, response, status) => {
  const headers = {
    'Content-Type': 'application/json',
    etag: digest,
  };

  // Can't write data in a head request
  response.writeHead(status, headers);
  response.end();
};

// getUsers GET
const getUsers = (request, response) => {
  const JSONResponse = {
    users,
  };

  // Client etag
  if (request.headers['if-none-match'] === digest) {
    return respondJSONHead(request, response, 304); // 304, already have file
  }

  return respondJSON(request, response, 200, JSONResponse); // 200
};

// getUsers HEAD
const getUsersHead = (request, response) => {
  // Client etag
  if (request.headers['if-none-match'] === digest) {
    return respondJSONHead(request, response, 304); // 304, already have file
  }

  return respondJSONHead(request, response, 200); // 200
};

// notReal GET
const getNotReal = (request, response) => {
  const JSONResponse = {
    message: 'Message: The page you are looking for was not found.',
  };

  return respondJSON(request, response, 404, JSONResponse); // 404
};

// notReal HEAD
const getNotRealHead = (request, response) => {
  // 404
  respondJSONHead(request, response, 404);
};

// addUser POST
const getAddUser = (request, response, params) => {
  // Make a new user
  const newUser = {
    name: params.name,
    age: params.age,
  };

  const JSONResponse = {
    message: 'Message: Created Successfully',
  };

  // Invalid parameters
  if (!params.name || !params.age) {
    JSONResponse.id = 'badRequest';
    JSONResponse.message = 'Message: Name and age are both required.';
    return respondJSON(request, response, 400, JSONResponse);
  }

  users[newUser.name] = newUser; // Add the user

  etag = crypto.createHash('sha1').update(JSON.stringify(users)); // Create a new hash object
  digest = etag.digest('hex'); // Recalculate the hash digest for the etag

  return respondJSON(request, response, 201, JSONResponse); // 201
};

// notFound GET
const notFound = (request, response) => {
  // 404
  respondJSONHead(request, response, 404);
};

module.exports = {
  getUsers,
  getUsersHead,
  getNotReal,
  getNotRealHead,
  getAddUser,
  notFound,
};
