river-web
=========

A browser client for River servers

Usage
-----

The client is hosted at http://william-alexander.github.io/river-web. You can
access it there, or host the client yourself if you wish. Note that the protocol
must not be `https`, since otherwise, browsers will block the unencrypted
requests to the River server.

The server to connect to is specified in the URL. For instance, if the River
server was running on `www.mydomain.com` and was accessible through port 21313,
it could be accessed at
http://wwalexander.github.io/river-web/?www.mydomain.com:21313.
