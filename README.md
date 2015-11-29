Audience Connect
================

Audience Connect is a web application that allows presenters to connect with their audiences
via live chat and polling.

It was made with ❤ by:
 - Albert Fung
 - Jason Runzer
 - Pat Smuk
 - Stuart Calverley


Setup Instructions
------------------

1. Install:
   1. [Node.js](https://nodejs.org/en/download/)
   2. [PostgreSQL](http://www.postgresql.org/download/)
   3. Gulp via `npm install gulp -g` (after installing Node.js)
2. Inside this project's directory, run `npm install` (npm is included with Node.js).
3. Create a new database called `audience_connect` in PostgreSQL.
4. Execute `schema.sql` on the database.
5. Edit `database_info.json` so that the app has valid credentials for accessing the database.
6. To run the app:
   1. In *debug mode* (live reloading, stack traces), run `gulp` and wait a few seconds for `webpack` to finish.
   2. In *production mode* (no live reloading, no stack traces), run `gulp webpack` and then either:
      1. `NODE_ENV=production PORT=80 bin/www` if you use Bash.
      2. `cmd /C "set NODE_ENV=production && set PORT=80 && node ./bin/www"` if you use Command Prompt.
7. Open the app in your favorite web browser by going to http://127.0.0.1/ (or http://127.0.0.1:3000/ in debug mode).


Notes
-----

 - Our API backend is fully unit-tested! Run `npm test` to run the test suite.
 - After registering a new account you must manually set the `full_name`, `student_id`, and `avatar`
   fields in the `users` table and set `verified` to `true` before it can be used.
   - The avatar should be a 50x50 pixel Base64-encoded data URL.
   - You can use [this online tool](http://base64online.org/encode/) to convert an image; make sure to check the "Format as Data URL" box.
 - To make an account a "presenter" (full access) set the `presenter` field to `true` in the `users` table.