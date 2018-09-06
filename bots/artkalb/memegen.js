'use strict';

const Canvas = require('canvas');
const path = require('path');
const fs = require('fs');
const groupme = require('../../groupme-services');

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
    this.write(top.toUpperCase(), this.width / 2, 10, this.width - 20, this.height / 5, false);

    // bottom text
    this.ctx.textBaseline = 'bottom';
    this.write(bottom.toUpperCase(), this.width / 2, this.height - 10, this.width - 20, this.height / 5, true);

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
          lines[reverse ? 'unshift' : 'push'](line);
          line = words[i];
        } else {
          line = next;
        }
      }

      lines[reverse ? 'unshift' : 'push'](line);

      if (lines.length * lineHeight < height) break;
    }

    for (var line of lines) {
      this.ctx.strokeText(line, x, y);
      this.ctx.fillText(line, x, y);
      y += reverse ? -lineHeight : lineHeight;
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

    return gen;
  }
}())

class MemeFactory {
  constructor (options) {
    this.options = options;

    if (options.pickupLines && options.pickupLines.get) {
      this.fetch = () => {
        var time = +new Date();

        if (this.cache && time < this.lastFetchTime + this.cacheExpiration) {
          return this.cache;
        }

        this.lastFetchTime = time;

        return Promise.resolve(options.pickupLines.get())
          .then(memes => {
            this.cache = memes;
            return this.cache;
          });
      };
      this.cache = null;
      this.update = options.pickupLines.update;
      this.cacheExpiration = options.pickupLines.cacheExpiration || 60 * 60 * 1000;
      this.lastFetchTime = -Infinity;
    }

    this._gen = null;
  }

  async getGenerator() {
    if (!this._gen) {
      var imgBuf = await new Promise(function (resolve, reject) {

        // TODO: make this path a config value?
        fs.readFile(path.join(__dirname, './creepyart.jpg'), function (err, buf) {
          if (err) reject(err);
          else     resolve(buf);
        });
      });
      var image = new Canvas.Image; //await loadImage('./creepyart.jpg')
      image.src = imgBuf;

      this._gen = new MemeGen(image, 400, 519); // TODO: calculate width / height
    }

    return this._gen;
  }

  // gets a random meme from the database,
  // generates its image if necessary,
  // and returns its url.
  async getMeme () {
    if (!this.fetch) {
      return null;
    }

    var memes = await this.fetch();

    if (!memes || memes.length === 0) {
      return null;
    }

    // fetch a random row from the table
    var meme = memes[Math.floor(Math.random() * memes.length)];

    // if meme has not been generated
    if (!meme.url) {
      var gen = await this.getGenerator();

      // generate & upload image
      meme.url = await groupme.uploadImagePNG(
        gen.generate(meme.topText, meme.bottomText),
        this.options.groupmeApiToken
      );

      // update database
      this.update && this.update(meme);
    }

    return meme.url;
  }
}

module.exports = MemeFactory;