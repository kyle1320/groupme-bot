'use strict';

const Canvas = require('canvas')
const pg = require('pg')
const path = require('path')
const fs = require('fs')
const url = require('url')
const groupme = require('../../groupme-services')

/* DATABASE SETUP */

const params = url.parse(process.env.DATABASE_URL)
const serverAuth = params.auth.split(':')
const config = {
  user: serverAuth[0],
  password: serverAuth[1],
  host: params.hostname,
  port: params.port,
  database: params.pathname.split('/')[1],
  ssl: true
}

const TABLES = {
  MEMES: 'memes'
}
const COLS = {
  ID: 'id',
  TOP_TEXT: 'top_text',
  BOTTOM_TEXT: 'bottom_text',
  URL: 'url'
}

const pool = new pg.Pool(config)
const created = pool.query(`
  CREATE TABLE IF NOT EXISTS ${TABLES.MEMES}(
    ${COLS.ID}          BIGSERIAL     PRIMARY KEY,
    ${COLS.TOP_TEXT}    VARCHAR(5000) NOT NULL,
    ${COLS.BOTTOM_TEXT} VARCHAR(5000) NOT NULL,
    ${COLS.URL}         VARCHAR(5000)
  );
`).catch(function (err) {
  console.error(err)
})

// Meme generation helper class
class MemeGen {
  constructor (image, width, height) {
    this.width = width;
    this.height = height;
    this.canvas = new Canvas(width, height);
    this.ctx = this.canvas.getContext("2d");
    this.image = image;
  }

  generate(top, bottom) {

    // clear the canvas and draw the background
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.drawImage(this.image, 0, 0, this.width, this.height);

    this.ctx.lineWidth    = 2;
    this.ctx.strokeStyle  = 'black';
    this.ctx.fillStyle    = 'white';
    this.ctx.textAlign    = 'center';

    // top text
    this.ctx.textBaseline = 'top';
    this.write(top.toUpperCase(), this.width / 2, 10, this.width - 20, this.height / 5, false)

    // bottom text
    this.ctx.textBaseline = 'bottom';
    this.write(bottom.toUpperCase(), this.width / 2, this.height - 10, this.width - 20, this.height / 5, true)

    // return a stream with the generated image
    return this.canvas.toBuffer();
  }

  write(text, x, y, width, height, reverse) {
    var words = text.split(' ');
    var lineHeight;
    var lines = [];

    // try different font sizes until one fits within the target bounds
    // 5 is the minimum size
    for (var s = Math.floor(height / 5) * 5; s > 5; s -= 5) {
      lines = [];
      var line = '';
      lineHeight = s * 1.4;

      this.ctx.font = s + 'pt impact';

      for(var i = 0; i < words.length; i++) {
        var next = (line ? line + ' ' : line) + words[i];

        if (this.ctx.measureText(next).width > width) {
          lines[reverse ? 'unshift' : 'push'](line)
          line = words[i];
        } else {
          line = next;
        }
      }

      lines[reverse ? 'unshift' : 'push'](line)

      if (lines.length * lineHeight < height) break;
    }

    for (var line of lines) {
      this.ctx.strokeText(line, x, y);
      this.ctx.fillText(line, x, y);
      y += reverse ? -lineHeight : lineHeight
    }
  }
}

// provides an async function to get a generator for the creepy Art meme.
// this way the image generator is only loaded when needed.
var getGenerator = (function() {
  var gen = null

  return async function() {
    if (!gen) {
      var imgBuf = await new Promise(function (resolve, reject) {

        // TODO: make this path a config value?
        fs.readFile(path.join(__dirname, './creepyart.jpg'), function (err, buf) {
          if (err) reject(err)
          else resolve(buf)
        })
      })
      var image = new Canvas.Image; //await loadImage('./creepyart.jpg')
      image.src = imgBuf;

      gen = new MemeGen(image, 400, 519); // TODO: calculate width / height
    }

    return gen
  }
}())

// gets a random meme from the database,
// generates its image if necessary,
// and returns its url.
module.exports = async function getMeme () {
  await created;

  // fetch a random row from the table
  var meme = await pool.query(`
    SELECT * FROM ${TABLES.MEMES}
    ORDER BY RANDOM()
    LIMIT 1
  `)

  // no memes :(
  if (!meme.rowCount) {
    return null;
  }

  meme = meme.rows[0]

  // if meme has not been generated
  if (!meme.url) {
    var gen = await getGenerator();

    // generate & upload image
    meme.url = await groupme.uploadImagePNG(
      gen.generate(meme[COLS.TOP_TEXT], meme[COLS.BOTTOM_TEXT])
    )

    // update database
    pool.query(`
      UPDATE ${TABLES.MEMES}
      SET ${COLS.URL} = $1
      WHERE ${COLS.ID} = $2
    `, [meme.url, meme.id])
  }

  return meme.url;
}