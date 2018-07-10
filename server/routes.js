const crawler = require('./controllers/crawler');
const getStats = require('./controllers/query');
const runKmeans = require('./controllers/kmeans');
const fs = require('fs');
const moment = require('moment');
const Album = require('./models/album.model');



module.exports = app => {
    app.get('/', async (req, res) => {
        try {
            const {
                tables
            } = await getStats();
            // console.log(tables)
            res.render('index.ejs', {
                tables
            });
        } catch (error) {
            console.error(error);
        }
    });

    app.get('/getdata', async (req, res) => {
        const data = await getStats();
        res.json(data);
    });


    app.get('/kmeans', async (req, res) => {
        try {
            // const albums = await Album.find();
            res.render('kmeans.ejs', {
                    k: 2,
                    param: '',
                    response: ''
                }

                // , {albums}
            );
        } catch (error) {
            console.error(error);
        }
    });


    app.post('/calc', async (req, res) => {
        try {
            let {
                k,
                param
            } = req.body;
            const result = await runKmeans(k, [param]);

            // console.log("DONE %o", result);
            // Cluster 1
            seachParam = '';
            if (param === 'genre') {
                seachParam = 'token.genre';
            } else if (param === 'style') {
                seachParam = 'token.style';
            } else if (param === 'released') {
                    seachParam = 'year'
            }



            let response = '';
            result.map((r, i) => {
                response += `Cluster ${i}, size: ${r.cluster.length}, centroid: ${r.centroid[0]}
                `;
            });
            console.log('Response', response)

            res.render('kmeans.ejs', {
                k: k || 2,
                param: param || '',
                response: JSON.stringify(response) || ''
            });
            // For each cluster
            await Promise.all(result.map(async (resCluster, i) => {
                await Promise.all([...new Set(resCluster.cluster.map(c => c[0]))].map(async (c) => {
                    // console.log('C' ,c);
                    const albums = (await Album.find({
                        [seachParam]: c
                    })).map(a => {

                        fs.appendFileSync(`./results/${param}-${k}-${i+1}-${moment().format('YYYY-MM-DD')}`, `ID: ${a._id} Title: ${a.title} Artist:${a.artists.join(', ')}\n`);
                    });
                }));
            }));
            console.log('DONE!!!');

        } catch (error) {
            console.error(error);
        }
    });


    app.get('/downloaddb', (req, res) => {
        res.setHeader('Content-disposition', `attachment; filename=${Date.now()}.csv`);
        res.set('Content-Type', 'text/csv');
        res.status(200).download('./albums.csv');
        // res.download(file); // Set disposition and send it.
    });
}