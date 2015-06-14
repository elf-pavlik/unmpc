# unmpc

[Micropub](http://indiewebcamp.com/micropub) client implemented as [Unhosted web
app](https://unhosted.org/)

## FIXME

### app.js
* [ ] get initial space from config
* [ ] get container node in different way
* [ ] remove query after auth and set ?url=

## TODO

* [ ] reuse saved access tokens
* [ ] use query-string library to parse/serialize
* [ ] setup CORS proxy as fallback (client_id ?)


## BACKLOG
* [ ] subscribe to live updates (via SSE)
* [ ] color highlight if agent uses HTTPS (warning if not)
* [ ] color highlight if feed uses HTTPS (warning if not)
* [ ] fetch authors profiles and include avatars if discovered
* [ ] *cite* button to populate text area from selection
* [ ] remote storage: subscriptions + contacts
