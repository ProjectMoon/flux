flux
====
Flux is an easy way to find and acquire public torrent files using Node.
This module provides fancy, programmatic access to the following public
torrent sites:

* torrentz.eu: torrent metasearch engine.
* VODO: free, legal, high quality movies and shows.

Installation
------------
The easiest way to install flux is through npm:

    npm install flux
    
This will drop it into the current `node_modules` directory and make it
available to Node.

Flux can also be installed manually by checking out the git repository
and copying the `lib` directory to the desired destination and `require`
ing the full path.

Tests
-----
flux uses vows for unit testing:

    vows -i test/*
    
Note: running with -i is required or else the tests won't work correctly.

Basic Usage
-----------
If the goal is to just get a torrent file, the `acquire` function will
automatically find a torrent and download it. It will take the top
result and download from the first available source, and then save it
to the current directory:

```javascript
var flux = require('flux');

flux.acquire('ubuntu 11.04', function(err) {
    if (err) {
        console.log('there was an error: ' + err.message);
    }
    else {
        console.log('ubuntu torrent downloaded!');
    }
});
```

Advanced Usage
--------------
Flux is very straightforward. It exposes a very simple, fully async API.
Below is a guide to the more advanced usage of flux. 

In order to use flux, you must `require` it:
```javascript
var flux = require('flux');
```

### Finding Torrent Files ###
Use of flux begins with finding torrents to download. The `search` and
`find` functions are exposed for this purpose. `search` performs a full
search against all provders, while `find` will return the top result for
each provider:

```javascript
var flux = require('flux');

//returns a list of torrents from all configured providers. this can be
//very large.
flux.search('ubuntu 11.04', function(err, torrents) {
    for (var c = 0; c < torrents.length; c++) {
        console.log(torrents[c]);
    }
});

//returns a list of the top results from each provider. each provider
//will have one entry in the list (one top result per provider).
flux.find('zenith', function(err, torrents) {
    console.log(torrents);
});
```

A `torrent` is an object that describes a result from a provider. This
result from the `find` call for 'zenith' is a list with a single entry.
This entry is a result for Zenith, a free movie on VODO
( http://www.vodo.net/zenith ):

```javascript
{ title: 'Zenith Part 1 2011 720p x264 VODO',
  torrentInfo: 
   { size: '1152 Mb',
     seeds: '3,301',
     peers: '98',
     hash: '1112d9e509d6fcd93d9c6be45f70994a93d4dc32' },
  provider: 'Torrentz',
  category: 'Movies',
  contentInfo: 
   { isHD: true,
     quality: '720p',
     codec: 'H.264',
     digitalMedium: 'Unknown',
     originalMedium: 'Unknown' } }
```

The `torrentInfo` object describes the torrent file with information
gleaned from the website. Note that not all information might be
available for a given torrent. It depends on what information the
provider exposes.

The `contentInfo` object will change based on what information is in the
search result. Currently, the following types of content are supported:

* Movies
* Audio (music, soundtracks)

Support for the following is planned:

* Software
* TV Shows

### Locating Torrents ###
After having found torrent files to download, flux must be pointed to
one or more sources in order to actually download the file. There are
two API calls for this: `locate` and `source`. They following the above
pattern: `locate` will find all possible sources for a torrent and
`source` will find a specific source, if it's available.

If your goal is to download a torrent, this step is optional. The fetch
function will call `locate` internally if it is given a torrent search
result (see below). If you need control over the download source, this
step is required.


```javascript
//returns an associative array of source name -> source
flux.locate(torrent, function(err, sources) {
    console.log(sources);
});

//returns just a single source object.
flux.source('torlock.com', torrent, function(err, source) {
    console.log(source);
});
```

A `source` is an object of the following structure:

```javascript
{ name: 'sometorrentsite.com',
     href: 'http://www.sometorrentsite.com/torrent/abcd' }
```

Note: the `href` property of a source is not necessarily a direct
download link!

The `locate` method returns an associative array with torrent hashes as
the keys. Each entry in this associative array is itself an associative
array, describing all of the sources for that particular torrent.

The `source` method always returns a single source object.

`source` and `locate` can take a single torrent result or a list of 
results. The returned set of sources will be compiled for all passed in
results.

### Downloading Torrents ###
The final step to getting a torrent file is to download it. The single
`fetch` API call is provided for this:

```javascript
//fetch a torrent from first available source
flux.fetch(torrent, 'mytorrent.torrent', function(err) {
    //err will be null if successful.
});

//or fetch from a source directly
flux.fetch(source, 'mytorrent.torrent', function(err) {
    //...
});
```

The torrent file is saved to the current working directory by default.
This can be changed via configuration (see below). If the download was
successful, the err parameter of the callback will null.

Configuration
-------------
flux exposes some simple configuration properties. The default config is
below:

```javascript
{
    saveDir: '.',
    ignoredSources: [],
    verbose: false,
    providers: [ flux.torrentz ]
}
```

The save directory (`saveDir`) is where all torrent files will be saved
after being downloaded. `ignoredSources` will remove various torrent
sites from the list of sources to download from. Setting `verbose` to
true will enable the logging functionality. Configuration is modified by
calling `flux.configure`:

```javascript
flux.configure({
    saveDir: './torrents',
    ignoredSources: [ '1337x.org' ],
    verbose: true,
    providers: [ flux.vodo, flux.torrentz ]
});
```

#### Providers ####
The following providers currently exist:

* `flux.torrentz`: Programmatic access to the torrentz.eu search engine
  and the many torrent sites it indexes. Not all sources are implemented
  for torrentz yet, but enough should be implemented to download almost
  any torrent indexed by the site.
* `flux.vodo`: Programmatic access to VODO films. The provider has one
  source (itself). Provides access to all of VODO's feature films and
  TV shows. Does not search the "non-promoted" videos. Not enabled by
  default.

Custom Providers
----------------
Custom providers can be coded in order to search any given content source
(website, file, etc). Every provider must be a module that exports the
following properties and methods:

* `name`: The name of this provider (string).
* `owns(torrent)`: True if this torrent object is owned by the provider. Check
  against `torrent.provider` property.
* `search(text, callback)`: Given a query, returns a list of relevant results.
  The objects in the list must be torrent objects as described under "Finding
  Torrent Files". Asynchronous.
* `find(text, callback)`: Given a query, returns the top result as a torrent
   object. Asynchronous.
* `locate(torrent, callback)`: Given a torrent object, locates download sources
   for that torrent. Returned result must be a object with a single entry (key
   being the hash of the torrent). The value of this property is itself an object
   where each property key is a source name, and the value is { name, href }.
   `name` is the source name, and `href` is the torrent download link.
* `source(sourceName, torrent, callback)`: Given a source name and torrent
  object, locates and creates the corresponding source object. Result must be
  a Location object. Asynchronous.
   
When the provider is complete, it can be passed into `flux.configure` as a
provider like any built-in provider.

Disclaimers
-----------
This software is not affiliated with any provider or site it connects
to in any way. It isn't owned by those websites, and its developers have
no connection to the sites. All data and information comes from
torrentz.eu, vodo.net, or other domains; this software simply gives
programmatic access to these websites.
