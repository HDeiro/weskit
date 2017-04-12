# Weskit

Weskit is an template for use on development of web projects.

## Dependencies

1. [Sass](http://sass-lang.com/install)

2. [NPM](https://nodejs.org/en/)

3. Gulp

```
npm i -g gulp
```

## Configuring

First of all, clone the repository with:

```
git clone https://github.com/HDeiro/weskit.git
```

After you clone the repository, you should install the dependencies.

```
npm i
```

## Basic Usage

You can read the tasks in the ```gulpfile.js```. But, the major ones are:

1. ```gulp watch```: starts to watching alterations at the sources (HTML, PHP, SASS/SCSS, JS) and applies other task like `scripts` for JS modifications;

2. ```gulp serve```: starts a local webserver with browser sync. You can access BS Dashboard throught ```localhost:3001```, and there you have access to a bunch of configurations that you can use.
