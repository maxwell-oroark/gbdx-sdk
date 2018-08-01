const fetchParse = require('./lib/fetch-parse')

class BaseApi {
  constructor(token) {
    this._token = token;
    this._apiUrl = process.env.REACT_APP_GBDX_API || 'https://geobigdata.io';
    this.updateToken = this.updateToken.bind(this);
    this._buildSearchString = this._buildSearchString.bind(this);
    this._fetchParse = this._fetchParse.bind(this);
  }

  updateToken(token) {
    this._token = token;
  }

  _buildSearchString(params, limit = 100, page = 1) {
    // TODO - Update this once the core API is changed to limit= instead of per_page=
    const searchParams = Object.entries(params);
    const baseParams = `?per_page=${limit}&page=${page}`;

    return searchParams.reduce(
      (string, [field, value]) => `${string}&${field}=${value}`,
      baseParams
    );
  }

  _fetchParse(method, url = '', body) {
    const options = {
      method,
      headers: {
        Authorization: `Bearer ${this._token}`
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
      options.headers['Content-Type'] = 'application/json';
    }

    return fetchParse([this._apiUrl, url].join(''), options);
  }
}

class AuthApi extends BaseApi {
  constructor(token) {
    super(token);

    this._apiUrl = `${process.env.REACT_APP_GBDX_API ||
      'https://geobigdata.io'}/auth/v1/oauth`;
    this.validatePassword = this.validatePassword.bind(this);
  }

  validatePassword(username, password) {
    const formData = new FormData();
    formData.append('grant_type', 'password');
    formData.append('username', username);
    formData.append('password', password);

    const options = {
      method: 'POST',
      body: formData
    };

    return fetchParse(`${this._apiUrl}/token`, options);
  };
}

class UsersApi extends BaseApi {
  constructor(token) {
    super(token);

    this._apiUrl = `${process.env.REACT_APP_GBDX_API ||
      'https://geobigdata.io'}/users/v1/users`;
    this.create = this.create.bind(this);
    this.me = this.me.bind(this);
    this.search = this.search.bind(this);
    this.resendInvite = this.resendInvite.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  create(params) {
    return this._fetchParse('POST', null, params)
  }

  me() {
    return this._fetchParse('GET', '/me');
  }

  search(params, page){
    return this._fetchParse('GET', this._buildSearchString(params, 100, page));
  }

  update(id, params){
    return this._fetchParse('PATCH', `/${id}`, params);
  }

  delete(id){
    return this._fetchParse('DELETE', `/${id}`);
  }

  resendInvite(id){
    return this._fetchParse('GET', `/${id}/emails/welcome`);
  }
}

class AccountsApi extends BaseApi {
  constructor(token) {
    super(token);

    this._apiUrl = `${process.env.REACT_APP_GBDX_API ||
      'https://geobigdata.io'}/accounts/v1/accounts`;
    this._buildSearchString = this._buildSearchString.bind(this);
    this.create = this.create.bind(this);
    this.get = this.get.bind(this);
    this.search = this.search.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  _buildSearchString(params, limit = 100, page = 1) {
    const searchParams = Object.entries(params);
    const baseParams = `?limit=${limit}&page=${page}`;

    return searchParams.reduce(
      (string, [field, value]) => `${string}&${field}=${value}`,
      baseParams
    );
  }

  create(params){
    return this._fetchParse('POST', null, params);
  }

  get(id){
    return this._fetchParse('GET', `/${id}`);
  }

  search(params, page){
    return this._fetchParse('GET', this._buildSearchString(params, 100, page));
  }

  update(id, params){
    return this._fetchParse('PATCH', `/${id}`, params);
  }

  delete(id) {
    return this._fetchParse('DELETE', `/${id}`);
  }
}

class BillingApi extends BaseApi {
  constructor(token) {
    super(token);
    this._apiUrl = `${process.env.REACT_APP_GBDX_API ||
      'https://geobigdata.io'}/billing/v1`;
  }

  fetchCustomer(gbdxAccountId){

    return this._fetchParse('GET', `/accounts/${gbdxAccountId}`, null);
  }

  validateCouponCode(code){
    return this._fetchParse('GET', `/coupons/${code}`, null);
  }

  createSubscription(gbdxAccountId, params){
    return this._fetchParse(
      'POST',
      `/accounts/${gbdxAccountId}/subscriptions`,
      params
    );
  }

  cancelSubscription(gbdxAccountId, subscriptionId){
    return this._fetchParse(
      'DELETE',
      `/accounts/${gbdxAccountId}/subscriptions/${subscriptionId}`
    );
  }

  fetchPlans(){
    return this._fetchParse('GET', `/plans`, null);
  }

  updateDefaultPaymentSource(gbdxAccountId, params){
    return this._fetchParse(
      'POST',
      `/accounts/${gbdxAccountId}/default_payment_source`,
      params
    );
  }

  fetchHistory(gbdxAccountId){
    return this._fetchParse('GET', `/accounts/${gbdxAccountId}/invoices`, null);
  }
}

module.exports = function(token){
  return {
    auth: new AuthApi(token),
    users: new UsersApi(token),
    accounts: new AccountsApi(token),
    billing: new BillingApi(token),
    updateToken: function(token) {
      this.users.updateToken(token);
      this.accounts.updateToken(token);
      this.billing.updateToken(token);
    }
  }
};
