const kmeans = require('node-kmeans');
const Album = require('../models/album.model');
const moment = require('moment');
var TfIdf = require('node-tfidf');

const {
  style,
  genre
} = require('./style.data');

const data = [{
    'company': 'Microsoft',
    'size': 91259,
    'revenue': 60420
  },
  {
    'company': 'IBM',
    'size': 400000,
    'revenue': 98787
  },
  {
    'company': 'Skype',
    'size': 700,
    'revenue': 716
  },
  {
    'company': 'SAP',
    'size': 48000,
    'revenue': 11567
  },
  {
    'company': 'Yahoo!',
    'size': 14000,
    'revenue': 6426
  },
  {
    'company': 'eBay',
    'size': 15000,
    'revenue': 8700
  },
];


// const data = [
//   {'company': 'Microsoft' , 'size': 91259, 'revenue': 60420},
//   {'company': 'IBM' , 'size': 400000, 'revenue': 98787},
//   {'company': 'Skype' , 'size': 700, 'revenue': 716},
//   {'company': 'SAP' , 'size': 48000, 'revenue': 11567},
//   {'company': 'Yahoo!' , 'size': 14000 , 'revenue': 6426 },
// ];

// var data = [
//   {'size': 10,'revenue': 72},
//   {'size':  12,  'revenue': 71},
//   {'size':  15, 'revenue': 65},
//   {'size': 08, 'revenue': 83},
//   {'size': 11, 'revenue': 70}
// ];

// Create the data 2D-array (vectors) describing the data

const getAllGenreNStyle = async () => {
  const genre = [];
  const style = [];
  const albums = await Promise.all((await Album.find()).map(album => {
    album.genre.map(g => {
      if (!genre.includes(g))
        genre.push(g);
    });
    album.style.map(s => {
      if (!style.includes(s))
        style.push(s);
    });
  }));
  console.log('Genre', genre);
  console.log('Style', style);
  require('fs').writeFileSync('style', style);
};
// getAllGenreNStyle();

const tokenization = async (param) => {
  console.log('Start tokenized:', param);
  const all = param === 'style' ? style : genre;
  console.log('ALL',all);


  const albums = await Promise.all((await Album.find()).map(async album => {

    // var foo = 0b11111111111111111111111111111111111111111111111;
    let token = 0b0;
    await Promise.all(album[param].map(async p => {
      const index = all.indexOf(p);
      if (index === -1) console.error("ERORO JEBETO ");
      else {
        token |= 0b1 << index;
      }
    }));

    // console.log('Token', token)
    album.token[param] = parseFloat(token);
    if(typeof album.token[param] !== 'number'){
      console.log(`OPA, ${album._id}, ${album.token[param]} ${typeof album.token[param]}`);
      // album.token[param] = 0;
    }
    album.save();

  }));
  console.log('Collecting finished');
};

// tokenization('style'); // 'genre'
// tokenization('genre'); // 'genre'




module.exports = runKmeans = (k, params) => {
  return new Promise(async (resolve, reject) => {
    try {

      console.log(`Start collecting data for kmeans: ${k}, param: ${params[0]}`);
      const data = (await Album.find()).map(album => ({
        // released: moment(album.released).year()
        [params[0]]: album.token[params[0]]
      }));
      console.log('Done collecting', data.length);

      let vectors = new Array();
      for (let i = 0; i < data.length; i++) {
        vectors[i] = [];
        params.forEach(param => {
          if(typeof data[i][param] !== 'number'){
            console.log('h', data[i][param])
            data[i][param] = 0;
          }
          vectors[i].push(data[i][param]);

        });
      }
      console.log('Created vectors');


      kmeans.clusterize(vectors, {
        k
      }, (err, res) => {
        if (err) console.error(err);
        else {
          resolve(res);
        }
      });
    } catch (error) {
      reject(error)
    }
  });
};

// runKmeans(2, ['size', 'revenue']);
// runKmeans(3, ['size']);

// runKmeans(2, ['released']);
// runKmeans(2, ['released']);

// runKmeans(3, ['genre']);