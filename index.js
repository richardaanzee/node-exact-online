'use-strict';

/** Dependencies */
var querystring = require('querystring'),
    url = require('url'),
    https = require('https'),
    _ = require('lodash');

/**
 * Client
 * @param  {Object} options  Options object
 * @return {Client}          Returns itself
 */
var Client = function(options) {
  var defaults = {
    clientId: '',
    env: 'production',
  };

  this.options = _.merge({}, defaults, options);

  this.apiUrl = 'start.exactonline.nl';

  return this;
};

/**
 * Client constuctor
 * @param  {Object} options  Options object
 * @return {Client}          Returns a new instance of the Client object
 */
module.exports.createClient = function(options) {
  return new Client(options);
};


Client.prototype.sendRequest = function(endpoint, method, params, data, callback) {
  var _this = this,
      body;

  if(typeof params === 'function') {
    callback = params;
  } else if(typeof data === 'function') {
    callback = data;
  }

  if(typeof data === 'object') {
    body = querystring.stringify(data);
  }

  var headers = {
    'Cache-Control': 'no-cache',
  };

  if(method === 'POST') {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    headers['Content-Length'] = body.length;
  }

  var options = {
    host: this.apiUrl,
    port: 443,
    method: method,
    headers: headers
  };

  var paramString = querystring.stringify(params);

  if(typeof params === 'object' && paramString !== '') { 
    options.path = ['/api' + endpoint, '?', paramString].join('');
  } else {
    options.path = '/api' + endpoint;
  }

  var req = https.request(options, function(res) {
    var responseData = '';

    res.setEncoding('utf-8');

    // Add chunk to responseData
    res.on('data', function (chunk) {
      responseData += chunk;
    });

    // Request ended, wrap up
    res.on('end', function () {
      responseData = JSON.parse(responseData);
      callback(null, responseData);
    });
  });

  req.on('error', function(err) {
    callback(err, responseData);
  });

  // Write request body
  if(options.method === 'POST') {
    req.write(body);
  }

  // End request
  req.end();

};

/**
 * Get auth URL
 * @param {String} [redirectUri] Redirect URI
 * @param {String} [responseType] Response Type
 * @return {String} Authentication URL
 */
Client.prototype.authUrl = function(redirectUri, responseType) {
  var authUrl = url.resolve('https://' + this.apiUrl, '/api/oauth2/auth');

  authUrl += '?' + querystring.unescape(querystring.stringify({
    'response_type': responseType || 'code',
    'client_id': this.options.clientId,
    'redirect_uri': redirectUri,
  }));

  return authUrl;
};


/**
 * Get oauth token
 * @param {Function} callback Gets called after request is complete
 */
Client.prototype.token = function(code, grantType, redirectUri, callback) {
  var data = {
    grant_type: grantType,
    client_id: this.options.clientId,
    client_secret:this.options.clientSecret,
  } 

  switch(grantType) {
    case 'authorization_code':
      data.code = code;
      data.redirect_uri = redirectUri;
      data.force_login = 0;
      break;

    case 'refresh_token':
      data.refresh_token = code;
      break;
  }

  this.sendRequest('/oauth2/token', 'POST', {}, data, callback);
};