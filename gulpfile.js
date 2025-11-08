const path = require('path');
const fs = require('fs');
const { glob } = require('glob');
const { src, dest, watch, series } = require('gulp');
const dartSass = require('sass');
const gulpSass = require('gulp-sass');
const terser = require('gulp-terser');
const sharp = require('sharp');

const sass = gulpSass(dartSass);

const paths = {
    // Tu captura 'image_149724.png' muestra que tu SCSS principal es 'app.scss'
    // Si es 'style.scss' cámbialo.
    scss: 'src/scss/style.scss',
    js: 'src/js/**/*.js',
    html: '*.html'
}

function css( done ) {
    src(paths.scss, {sourcemaps: true})
        .pipe( sass({
            outputStyle: 'compressed'
        }).on('error', sass.logError) )
        .pipe( dest('./public/build/css', {sourcemaps: '.'}) );
    done()
}

function js( done ) {
    src(paths.js)
        .pipe(terser())
        .pipe(dest('./public/build/js'))
    done()
}

function html( done ) {
    src(paths.html)
        .pipe(dest('./public/build/'));
    done();
}

// --- ESTA ES LA SECCIÓN CORREGIDA ---

async function imagenes(done) {
    const srcDir = './src/img'; 
    const buildDir = './public/build/img';
    // Glob actualizado para incluir SVG
    const images =  await glob('./src/img/**/*.{jpg,png,jpeg,svg}');

    const promises = [];

    images.forEach(file => {
        const relativePath = path.relative(srcDir, path.dirname(file));
        const outputSubDir = path.join(buildDir, relativePath);
        // Empujamos las promesas al array
        promises.push(...procesarImagenUnica(file, outputSubDir));
    });

    // Esperamos a que todas las promesas se resuelvan
    try {
        await Promise.all(promises);
        done();
    } catch (error) {
        console.error("Error processing images:", error);
        done(error); // Pasamos el error a Gulp
    }
}

function procesarImagenUnica(file, outputSubDir) {
    if (!fs.existsSync(outputSubDir)) {
        fs.mkdirSync(outputSubDir, { recursive: true })
    }
    const baseName = path.basename(file, path.extname(file))
    const extName = path.extname(file)

    // Si es SVG, solo lo copiamos y retornamos una promesa resuelta
    if (extName.toLowerCase() === '.svg') {
        const outputFile = path.join(outputSubDir, `${baseName}${extName}`);
        fs.copyFileSync(file, outputFile);
        return [Promise.resolve()];
    } 

    // Si no es SVG, procesamos con Sharp y retornamos las promesas
    const outputFile = path.join(outputSubDir, `${baseName}${extName}`);
    const outputFileWebp = path.join(outputSubDir, `${baseName}.webp`);
    const outputFileAvif = path.join(outputSubDir, `${baseName}.avif`);
    const options = { quality: 80 };

    const promiseJpeg = sharp(file).jpeg(options).toFile(outputFile);
    const promiseWebp = sharp(file).webp(options).toFile(outputFileWebp);
    const promiseAvif = sharp(file).avif(options).toFile(outputFileAvif);

    return [promiseJpeg, promiseWebp, promiseAvif];
}

// --- FIN DE LA SECCIÓN CORREGIDA ---

function dev( done ) {
    watch( paths.scss, css );
    watch( paths.js, js );
    watch('src/img/**/*.{png,jpg}', imagenes)
    done();
}

// Exportamos las tareas
exports.build = series( html, js, css, imagenes );
exports.default = series( html, js, css, imagenes, dev );
function procesarImagenes(file, outputSubDir) {
    if (!fs.existsSync(outputSubDir)) {
        fs.mkdirSync(outputSubDir, { recursive: true })
    }
    const baseName = path.basename(file, path.extname(file))
    const extName = path.extname(file)

    if (extName.toLowerCase() === '.svg') {
        const outputFile = path.join(outputSubDir, `${baseName}${extName}`);
    fs.copyFileSync(file, outputFile);
    } else {
        const outputFile = path.join(outputSubDir, `${baseName}${extName}`);
        const outputFileWebp = path.join(outputSubDir, `${baseName}.webp`);
        const outputFileAvif = path.join(outputSubDir, `${baseName}.avif`);
        const options = { quality: 80 };

        sharp(file).jpeg(options).toFile(outputFile);
        sharp(file).webp(options).toFile(outputFileWebp);
        sharp(file).avif().toFile(outputFileAvif);
    }
}

function dev( done ) {
    watch( paths.scss, css );
    watch( paths.js, js );
    watch('src/img/**/*.{png,jpg}', imagenes) // Y esta
    done();
}

exports.build = series( html, js, css, imagenes );
exports.default = series( js, css, imagenes, dev );