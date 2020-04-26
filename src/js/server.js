/* eslint-disable no-unused-vars */
/* eslint-disable no-return-await */
/* eslint-disable consistent-return */

const http = require('http');
const path = require('path');
const Koa = require('koa');
const koaBody = require('koa-body');
const koaStatic = require('koa-static');
const fs = require('fs');

const app = new Koa();

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback()).listen(port);

// Static file handling
const imgFolder = path.join(__dirname, '/imgFolder');
app.use(koaStatic(imgFolder));

// CORS
app.use(async (ctx, next) => {
  const origin = ctx.request.get('Origin');
  if (!origin) {
    return await next();
  }
  const headers = { 'Access-Control-Allow-Origin': '*' };

  if (ctx.request.method !== 'OPTIONS') {
    ctx.response.set({ ...headers });
    try {
      return await next();
    } catch (e) {
      e.headers = { ...e.headers, ...headers };
      throw e;
    }
  }

  if (ctx.request.get('Access-Control-Request-Method')) {
    ctx.response.set({
      ...headers,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
    });

    if (ctx.request.get('Access-Control-Request-Headers')) {
      ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Request-Headers'));
    }
    ctx.response.status = 204;
  }
});

// Body Parsers
app.use(koaBody({
  text: true,
  urlencoded: true,
  multipart: true,
  json: true,
}));

// kod
let listImgs = [];

app.use(async (ctx) => {
  // GET
  if (ctx.method === 'GET') {
    const images = [];
    listImgs.forEach((item) => {
      images.push(item);
    });
    ctx.response.body = JSON.stringify(images);
  }

  // POST
  if (ctx.method === 'POST') {
    const { name } = ctx.request;
    const { file } = ctx.request.files;
    const link = await new Promise((resolve, reject) => {
      const oldPath = file.path;
      const filename = file.name;
      const newPath = path.join(imgFolder, filename);

      const callback = (error) => reject(error);

      const readStream = fs.createReadStream(oldPath);
      const writeStream = fs.createWriteStream(newPath);

      readStream.on('error', callback);
      writeStream.on('error', callback);

      readStream.on('close', () => {
        fs.unlinkSync(oldPath, callback);
        resolve(filename);
      });
      readStream.pipe(writeStream);
    });
    console.log(`${link} file was added`);
    listImgs.push(`https://http-server-3.herokuapp.com/${link}`);
    ctx.response.body = link;
    return;
  }

  // DELETE
  if (ctx.method === 'DELETE') {
    const { file } = ctx.request.query;
    const fileName = path.parse(file).base;
    listImgs = listImgs.filter((item) => item !== file);
    fs.unlink(`${imgFolder}/${fileName}`, (err) => {
      if (err) {
        console.log(err);
        throw err;
      }
      console.log(`${fileName} was deleted`);
    });
    ctx.response.body = 'ok';
  }
});
