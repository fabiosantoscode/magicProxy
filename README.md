# magicProxy


A proxy for front-end web development. It changes responses from remote websites.


Using this, you can forget about having your local HTTP server or using `rsync`/`wget` to sync your computer with the remote site, broken URLs and ajax APIs, cross-domain problems, and just access the website you are changing and activate the `replace.js` or `fakeDir.js` plugins.

You can also access websites only accessible to your computer (E.G. in your local server and/or with a hostname only you have in `/etc/hosts`) from the outside, by accessing through your proxy.


## Installation

1. Clone this repository

        git clone git@github.com:fabiosantoscode/magicProxy.git
        cd magicProxy

2. Npm install the dependencies

        npm install
      
3. Run the proxy

        node index.js -c magicproxyrc.example

4. Access your system's network configuration, and set up your proxy to `localhost`, port `8080`. Check that everything works.

5. Access http://www.example.com/, see the changes made by the proxy, and play around with magicproxyrc.example (the configurations are reloaded on the fly).


## Included plug-ins.

 - replace.js: Intercepts requests for key files and responds with local files instead.
 - fakeDir.js: Pretend a local folder is actually on the server.
 - markup.js: Uses [cheerio](https://github.com/MatthewMueller/cheerio) for changing HTML markup. You can insert or remove chunks.
 - empty.js: Empty some HTTP responses. Useful for annoying tracking scripts.
 - log.js: Log HTTP verbs, status codes and URLS for every response.

Configuration instructions are written in the plugins' `.js` files.


## Usage examples:

 - Work on the JS code of a remote website on its true environment without tripping on cross-domain policy
 - Change the living, working HTML on a remote website without worrying about using relative URLs
 - Stop scripts which jam your debugger from loading
 - Remove some elements from remote sites you are working on, such as video players, canvases, etc.

## Roadmap:

 - A plug-in interface with a unified configuration system
 - HTTPS support, WS support
 - A simple command line interface (execute on a folder, looks for .magicproxyrc configuration files and load them)
 - Run as a web application for showing others your local work
 - Split plugins into several projects
 - Verbose mode, which shows what requests were changed, and by which plugin
 - Automatic rebuild plugin, which watches directory for changes and executes a script when necessary

Be happy!

-- Fábio
