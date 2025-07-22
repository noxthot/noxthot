# Website
Uses [Grayscale](https://startbootstrap.com/theme/grayscale/), a multipurpose, one page HTML theme for [Bootstrap](https://getbootstrap.com/) created by [Start Bootstrap](https://startbootstrap.com/).

## Usage
### Basic Usage
After downloading, simply edit the HTML and CSS files included with `dist` directory.
These are the only files one needs to worry about.
Everything else can be ignored.
To preview the changes made to the code, one can open the `index.html` file in a web browser.

### Advanced Usage
Run `npm install` to install the dependencies required for building the project and `npm start` to open a live preview of the template in your default browser.
This will also watch for changes to core template files and live reload the browser when changes are saved.
You can view the `package.json` file to see which scripts are included.

#### npm Scripts

- `npm run build` builds the project - this builds assets, HTML, JS, and CSS into `dist`
- `npm run build:assets` copies the files in the `src/assets/` directory into `dist`
- `npm run build:pug` compiles the Pug located in the `src/pug/` directory into `dist`
- `npm run build:scripts` brings the `src/js/scripts.js` file into `dist`
- `npm run build:scss` compiles the SCSS files located in the `src/scss/` directory into `dist`
- `npm run clean` deletes the `dist` directory to prepare for rebuilding the project
- `npm run start:debug` runs the project in debug mode
- `npm start` or `npm run start` runs the project, launches a live preview in your default browser, and watches for changes made to files in `src`