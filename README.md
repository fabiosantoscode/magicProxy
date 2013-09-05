# magicProxy


A proxy for front-end web development. It changes responses from remote websites.


Using this, you can forget about having your local HTTP server or using `rsync`/`wget` to sync your computer with the remote site, broken URLs and ajax APIs, cross-domain problems, and just access the website you are changing


Currently configuration is pretty hardcoded, but I hope to have some time to create a proper configuration system + plugin architecture.


## Included plug-ins.

 - replace: Intercepts requests for key files and responds with local files instead
 - markup: Uses [cheerio](https://github.com/MatthewMueller/cheerio) for changing HTML markup. You can insert or remove chunks.
 - empty: Empty some HTTP responses. Useful for annoying tracking scripts.


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
