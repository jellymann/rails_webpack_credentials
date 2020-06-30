Been having problems using [`rails-erb-loader`](https://github.com/usabilityhub/rails-erb-loader) in practice. Since all I'm really using it for is injecting credentials into JS, I figured I'd just write a loader that just does that. It should be faster as well since it doesn't have to spin up a Rails environment for every file that needs it.

The secret sauce is in the [webpack loader](config/webpack/loaders/credentials/loader.js). It decrypts the credentials file using node's decipher, and just uses a plain-old-ruby process just to deserialise the decrypted file, since it's a marshalled string. Then, it just regexes a magic string in each JS file and replaces that with the value from the credentials, e.g.

```javascript
const API_KEY = $$RailsCredentials.some_api_key;
```

```yaml
# credentials.yml
some_api_key: XXX-00000-YYY
```

becomes:

```javascript
const API_KEY = "XXX-00000-YYY";
```

Usage can be seen in [application.js](app/javascript/packs/application.js#L18-L19). It supports nested keys, and it just JSON stringifies whatever you ask for, so if you get an object back you'll get an object.

NOTE: I still haven't added support for different credentials environments yet. But it should be as simple as reading `RAILS_ENV` and searching for the file if it exists.

CAVEAT: Just be careful not to accidentally leak secrets into the JS that you don't want to!!
