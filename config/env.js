/**
 * Module dependencies.
 */

var env = process.env;

function on(variable, defaultValue) {
  return variable ? JSON.parse(variable) : defaultValue;
}

module.exports = {
  socialauth: {
    facebook: {
      clientid: env.FACEBOOK_CLIENT_ID,
      token: env.FACEBOOK_SECRET_TOKEN
    },
    twitter: {
      clientid: env.TWITTER_CLIENT_ID,
      token: env.TWITTER_SECRET_TOKEN
    }
  }
};
