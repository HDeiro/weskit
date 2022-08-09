# Weskit

Weskit is a template project that is PWA Ready and provides a structure to start the development of web pages with some features like serving files with livereload, support to SASS, minification of files (JS/HTML/JSON/CSS), name mangling (for JS) & more.

## Settings

This project supports settings that can be found in `src/settings/settings.json`. There are various options to do stuff like:

- Enable/Disable built-in animation library;
- Set Google Analytics by adding the UA-key (if not provided, GA is not added);
- Override meta-tags via configurations;
- Load async CSS files;
- PWA Settings:
	- Enable the PWA capability;
	- Version of the PWA;
	- Caching info (files to be cached & cache prefix);

More settings will be added over time.

## How to run?

```
npm start
```

This command will copy all assets that exists in your `src` folder and push them to a `dist` folder (in case it doesn't exists already, it will be created).

After updating all assets, this command will be watching for changes in `.{scss,html,js}` files and refresh those types of assets when something changes. It will also run a [Browsersync](https://browsersync.io/) instance watching for changes and refreshing when you change something.

## How to generate the final build?

```
npm run build
```

This command will cleanup the dist folder (to cleanup any possible garbage from previous executions), copy all assets and optimize them. The optimizations added at the moment are mainly focused on the minification & mangling (whenever possible) of HTML, JavaScript, JSON & CSS files.
