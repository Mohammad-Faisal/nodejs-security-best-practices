## Description of the project

Today we will see how we can improve the security of a NodeJS application. There are lots of aspects to security in the NodeJS application. We will get familiar with many of the concepts and see how we can prevent unwanted attacks on our application.

Nothing is bulletproof, but being safe doesn't hurt

### The most popular one!

We will first use a nice npm package named [helmet](https://www.npmjs.com/package/helmet).

It sets up various HTTP headers to prevent attacks like Cross-Site-Scripting(XSS), clickjacking, etc.

```sh
yarn add helmet
```

Then use it inside your **index.ts**

```js
import helmet from 'helmet';

app.use(helmet());
```

That's it! You don't need to do anything else!

You should also take a look at [helmet-csp](https://www.npmjs.com/package/helmet-csp)

### Prevent DOS attack

DOS means Denial of Service. If an attacker tries to swamp your server with requests, our real users can feel the pain of slow response time.

To prevent this, we can use a nice package named [toobusy-js](https://www.npmjs.com/package/toobusy-js)
This will monitor the event loop, and we can define a lag parameter that will monitor the lag of the event loop and indicate if our event loop is too busy to serve requests right now.

```sh
yarn add toobusy-js
```

Then add a new middleware to indicate that the server is too busy right now.

```js
import too busy from 'toobusy-js';

app.use(function (req, res, next) {
  if (toobusy()) {
    res.send(503, 'Server too busy!');
  } else {
    next();
  }
});
```

### Rate Limiting

Rate limiting helps your application from brute-force attacks. This helps to prevent the server from being throttled.

Unauthorized users can perform any number of requests with malicious intent, and you can control that with rate-limiting.
For example, you can allow a user to make five requests per 15 minutes for creating an account.
Or you can allow unsubscribed users to make requests at a certain rate limit. something like 100requests/day

There is a nice package named [express-rate-limit](https://www.npmjs.com/package/express-rate-limit). First, install it

```sh
yarn add express-rate-limit
```

Then create a rate-limiting configuration for it.

```js
import rateLimit from 'express-rate-limit';

export default rateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hrs in milliseconds
  max: 100, // maximum number of request inside a window
  message: 'You have exceeded the 100 requests in 24 hrs limit!', // the message when they exceed limit
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const app = express();

app.use(rateLimiter);
```

This will allow you to add a rate limit for all of your routes. You can also just add rate-limiting for specific routes.

But if you are behind a proxy. This is the case for most cases when you use any cloud provider like Heroku aws etc., then the IP of the request is basically the IP of the proxy, which makes it look like that request is coming from a single source, and the server gets clogged up pretty quick.

To resolve this issue, you can find out the **numberOfProxies** between you and the server and set that count right after you create the express application.

```js
const numberOfProxies = 1;
const app = express();

app.set('trust proxy', numberOfProxies);
```

To learn more about [**trust proxy**](https://expressjs.com/en/guide/behind-proxies.html) refer to the [documentation](https://expressjs.com/en/guide/behind-proxies.html)

### Configure Cors

CORS will keep your application safe from malicious attacks from unknown sources
It's really easy to configure in nodejs.

```sh
npm i cors
```

then use it inside the index.ts file

``js
import cors from 'cors';

let corsOptions = {
  origin: 'http://example.com',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors());
```

## Prevent XSS attacks

XSS attack means cross-site scripting attacks. It injects malicious scripts into your application.

An attacker can use XSS to send a malicious script to an unsuspecting user. The end user's browser has no way to know that the script should not be trusted and will execute the script. Because it thinks the script came from a trusted source, the malicious script can access any cookies, session tokens, or other sensitive information retained by the browser and used with that site.

You can protect your application by using `xss-clean`

```sh
yarn add xss-clean
```

Then use it inside the `index.ts` file

```js
import xss from 'xss-clean';

app.use(xss());
```

### Prevent SQL Query injection attacks

If you use user input without checking them, a user can pass unexpected data and fundamentally change your SQL queries. 

For example, if your code looks like this.

```SQL
UPDATE users
    SET first_name="' + req.body.first_name +  '" WHERE id=1001;
```

If a user types his first name as 

```sh
Bobby", last_name="Egg"; --
```

Then the query becomes 
```sh
UPDATE users
    SET first_name="Bobby", last_name="Egg"; --" WHERE id=1001;
```

So all your users are named Bobby Egg which is not cool.

If you use [Sequalize](https://sequelize.org/), [TypeORM](https://typeorm.io/) or for MongoDB, we have [Mongoose](https://mongoosejs.com/) these types of ORM tools, then you are safe by default because these help us against the SQL query injection attacks by default.

If you don't want to use ORM then there are some other packages as well! 
For PostgreSQL we have [node-postgres](https://node-postgres.com/)

## Limit the size of the body of the request

Using [body-parser](https://github.com/expressjs/body-parser) you can set the limit on the size of the payload

```sh
npm i body-parser
```

By default, body-parser is configured to allow 100kb payloads size. You can set the limit like the following.

```js
import bodyParser from 'body-parser';
app.use(bodyParser.json({ limit: '50kb' }));
app.use(bodyParser.urlencoded({ extended: true }));
```

## Use linter

A linter can force you to follow these best practices by default. You can use [eslint-plugin-security](https://www.npmjs.com/package/eslint-plugin-security) for that.

```sh
yarn add -D eslint-plugin-security
```

And inside your **.eslintrc** file

```JSON
"extends": ["plugin:@typescript-eslint/recommended", "plugin:security/recommended"],
```

### Enforce HTTPS

It would be best if you always use HTTPS over HTTP when possible.

```sh
yarn add hsts
```

Then use it inside your **index.ts**
```js
import hsts from 'hsts';

app.use(
  hsts({
    maxAge: 15552000, // 180 days in seconds
  }),
);
// Strict-Transport-Security: max-age: 15552000; includeSubDomains
```

### Use CSRF Protection middleware

To learn more about CSRF. [Go here](https://github.com/pillarjs/understanding-csrf)
Consider using [csurf](https://github.com/expressjs/csurf)

```js
import csrf from 'csurf';
var csrfProtection = csrf({ cookie: true });

app.get('/form', csrfProtection, function (req, res) {
  // generate and pass the csrfToken to the view
  res.render('send', { csrfToken: req.csrfToken() });
});
```

This is not required for an application that doesn't handle any form of data.

### Validate Incoming Requests

You should consider validating the incoming requests to your application to check if they contain any malicious data. There are many ways to do this, but the most popular way is to use a schema validation library like Joi or class-validator.

You can refer to the following article for more information.

https://www.mohammadfaisal.dev/blog/request-validation-nodejs-express

### Validating Output
You want to secure the incoming data instead you should try to validate any data that you give output.
For example, if you render to the frontend using NodeJS, then this becomes an issue.

Let's say our user generates the following data for showing in the browser later.

```js
<script>alert('I am not sanitized!');</script>
```

This is harmless, but if you don't sanitize it before giving it back to the javascript frontend, then it can cause trouble.

To avoid this, we have several options.

[`html-escape`](https://www.npmjs.com/package/html-escape) // if you need to render html output
[`xml-escape`](https://www.npmjs.com/package/xml-escape) // if you need to give xml output
[`shell-escape`](https://www.npmjs.com/package/shell-escape) // for shell commands

These libraries can help you to sanitize the output as well.

### Using Hash for Sensitive Information
Storing passwords in plain text was never a good idea. You should instead create a has of your password.

A Hash is a fixed-sized string that we can generate from any string, and it's not decryptable by design. You can only produce it again if the same input text is given again.

So while storing passwords, you will create a hash of your password and store it in the database. This way, even if our database is exposed, the passwords will not be exposed.

### Using the Salt with Hash
There is a problem with the Hashing mechanism because two identical texts will always generate the same hash. As most people use very common passwords, this technique is vulnerable to exploitation.

To avoid this issue, we use a technique called salt. It's basically a random string that is appended to the given input. So even if you give two identical inputs, the outputs will not be the same.
### Hide errors from end-users

It would be best if you did not expose errors to your users. In order to do that, you will need to handle production environment error handling seriously. Following is a good guide on where you can start.

https://www.mohammadfaisal.dev/blog/error-handling-nodejs-express

### Load secrets securely

Be extra careful about loading secrets into your application. You must not include secrets as plain strings in the application. Using some kind of environment file is necessary to achieve this. You can refer to the following example for that.

https://www.mohammadfaisal.dev/blog/nodejs-environment-handling

### Compression

Compression is a technique that can reduce the size of the static file and JSON response.
In nodejs, that we can do with a nice middleware package named [**compression**](https://www.npmjs.com/package/compression)

First, install it

```sh
yarn add compression
```

Then add it inside your **index.ts**

```js
import compression from 'compression';
app.use(compression());
```

And that's it! There are other options that you can use. Refer to the documentation for that.

#### Some more resources:

https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html
https://medium.com/@nodepractices/were-under-attack-23-node-js-security-best-practices-e33c146cb87d

### Github Repo

https://github.com/Mohammad-Faisal/nodejs-security-best-practices
