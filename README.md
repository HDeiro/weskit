# Weskit

The weskit project provides the basic infrastructure for a webproject using Gulp.

## Dependencies

1. [NPM](https://nodejs.org/en/)

2. Gulp

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

There are two environments, ```app``` and ```www```. The source code that will be developed by you should be contained in ```app```. The ```www``` folder will contain only generated sources. **If you edit something there, it'll be overwrited**.

The gulp tasks bellow were explained bellow.

### Compile all JavaScript bundles

It'll compile all JS bundles and provide them to ```www/js```.

```
gulp js
```
- Note 1: In order to add/edit the bundles, you must add/change the desired bundle in the object ```paths```, located on the ```gulpfile.js```.

- Note 2: These "internal", "internal-critical" etc are boilerplate bundles. If you want to create a new bundle, just follow the same format provided.

- Note 3: If a bundle is critical, suffix it with "-critical" in order to insert it directly in the HTML on production task (explained later).

- Note 4: Each bundle will concat all JavaScript files. If order matters, add them to the bundle in the correct order.

- Note 5: If the const ```MODE_PRODUCTION``` is setted as true, the code will be minified. If you don't want this behavior during development, set it as false.

- Note 6: If you don't want to generate the sourcemaps, set ```skipSourcemapGeneration``` as true in the root of the bundle.

### Compile all CSS Bundles
It'll generate the CSS Bundles as defined in ```gulpfile.js```.

```
gulp css
```

- Note: Follow the same rules of JS, explained above, but in ```www/css``` folder.

### Compile all SASS Bundles

It'll compile all sass and generate their bundles as defined in ```gulpfile.js```.

```
gulp sass
```
- Note: Follow the same rules of JS, explained above, but in ```www/css``` folder.

### Compile views
It'll minify all view files and provide them to ```www``` folder in the same structure that they're in ```app```.

```
gulp views
```

### Generate metadata
This task will copy the metadata files to the root of ```www``` folder.

```
gulp generate-metadata
```

### Generate JSONs
It'll minify the json files and put them in ```www``` folder in the same structure that they're in ```app```.

```
gulp jsons
```

### Copy fonts
It'll copy font files to ```www/fonts``` folder.
```
gulp fonts
```

### Copy sounds
It'll copy sound files to ```www/sounds``` folder.

```
gulp sounds
```

### Copy videos
It'll copy video files to ```www/videos``` folder.
```
gulp videos
```

### Copy images
It'll compress all images in ```app/images``` folder and provide them to ```www/images``` folder.

```
gulp images
```

### Copy sprites
It'll generate a sprite with all images in ```app/images/sprites``` folder and provide them to ```www/images``` folder as ```sprite.png```.

```
gulp sprites
```

### Generate Icons
It'll generate icons in different resolutions for the icon file provided at ```app/images/pwa-icons``` folder and move them to ```www/pwa-icons``` suffixed by it's resolution (e.g.: icon-72x72.png).

```
gulp icons
```

### Local Server (Browsersync, for development)

It Runs an instance of browser-sync accessible via ```http://localhost:3000/```.

```
gulp server
```

- Note 1: To access via other devices in same network, go into ```http://localhost:3001/``` and use the External address.

- Note 2: A watcher will be ran for JavaScript, Views, CSS, SASS and JSONs. If you change something in these files, their tasks will be executed.

### Generate all assets

Execute all generation tasks.

```
gulp generate-all
```

### Generate production
Inserts the critical code (JS/CSS) into the HTML and adds the Service Worker for cache handling.

```
gulp production
```
