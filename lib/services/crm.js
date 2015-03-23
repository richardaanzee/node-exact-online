var util = require('util');

var CRM = exports.CRM = function (Client) {
  this.client = Client;

  return this;
};


/**
 * Create an account
 * @param {Function} callback Gets called after request is complete
 */
CRM.prototype.createAccount = function(userData, division, callback) {
  if(typeof division === 'function') {
    callback = division;
    division = this.client.division;
  }

  this.client.sendRequest('/v1/' + division + '/crm/Accounts', 'POST', null, userData, callback);
};

/**
 * Get document attachments
 * @param  {String}   documentId Document ID
 * @param  {Integer}   division   Division ID
 * @param  {Function} callback   Callback
 */
CRM.prototype.getDocumentAttachments = function(documentId, division, callback) {
  var params = {
    $filter: 'Document eq guid\''+ documentId +'\''
  };

  if(typeof division === 'function') {
    callback = division;
    division = this.client.division;
  }

  this.client.sendRequest('/v1/' + division + '/documents/DocumentAttachments', 'GET', params, null, callback);
};

