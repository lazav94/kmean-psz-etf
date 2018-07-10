const Crawler = require('crawler');
const _ = require('lodash');
const fs = require('fs');
const moment = require('moment');
const perf = require('execution-time')();

// Models
const Url = require('../models/url.model.js');
const Album = require('../models/album.model.js')

// Constants
const RS = 'Serbia';
const YU = 'Yugoslavia'


// Function: Get page number
const getPageNumber = async (url) => {
    return new Promise((resolve, reject) => {
        const c = new Crawler({
            maxConnections: 10,
            callback: async (error, res, done) => {
                if (error) {
                    console.log(error);
                    reject(error);
                } else {
                    const $ = res.$;
                    // 1. get number of all albums
                    let pageNumber = $('.pagination_total')[0].children[0].data;
                    pageNumber = parseInt(pageNumber.slice(pageNumber.lastIndexOf('of ') + 3, pageNumber.length).replace(',', ''));
                    // 2. calculate hom many page need to scrape
                    return resolve(Math.ceil(pageNumber / 250));
                }
                done();
            }
        });
        c.queue(url);
    });
}

// Function: Get all decade url
const getDecadeURL = (country) => {
    return new Promise((resolve, reject) => {
        const c = new Crawler({
            maxConnections: 10,
            callback: async (error, res, done) => {
                const decadeUrls = [];
                if (error) {
                    console.log(error);
                    reject(error);
                } else {
                    const $ = res.$;
                    // Get all <a> tags which contains 'decade' and make full link
                    let result = _.map(_.values($('a')), (element) => {
                        if (element.attribs) {
                            return element.attribs.href;
                        }
                    }).filter(url => {
                        if (url && url.includes('&decade=')) {
                            return `https://www.discogs.com${url}`;
                        }
                    }).map(url => `https://www.discogs.com${url}`);
                    resolve(result)
                    // console.log('Result', result)
                }
                done();
            }
        });
        c.queue(`https://www.discogs.com/search/?type=release&limit=250&country_exact=${country}`);
    });
}

// Function: get all url to scrape
const getURLs = async (country) => {
    // 1. Get all decades urls
    const decades = await getDecadeURL(country);
    console.log(`URLs for all decades for ${country}\n`, decades);
    const decadesYear = decades.map(decade => {
        const index = decade.indexOf('decade=') + 7;
        return decade.slice(index, index + 4);
    });
    console.log(decadesYear);

    let urls = [];
    // Get all urls from decade with pages
    for (let i = 0; i < decades.length; i++) {
        const pageNumber = await getPageNumber(decades[i]);
        console.log(`In ${decadesYear[i]} we have ${pageNumber} page to scrape`);
        for (let j = 1; j <= pageNumber; j++) {
            if (j <= 40) {
                urls.push(`${decades[i]}&sort=title%2Casc&page=${j}`);
            } else {
                urls.push(`${decades[i]}&sort=title%2Cdesc&page=${j-40}`);
            }
        }
    };
    console.log(`All [${urls.length}] URLs to scrape for ${country}\n`, urls);
    getUrlFromDecade(country, urls);
}

const getUrlFromDecade = async (country, listOfUrl) => {
    const url = await getURL();
    let urls = [];

    const c = new Crawler({
        maxConnections: 10,
        rateLimit: 1000,
        // This will be called for each crawled page
        callback: async (error, res, done) => {
            if (error) {
                console.log(error);
                reject(error);
            } else {
                const $ = res.$;
                // Get all url which contains release and not (sell add...)
                let result = await _.map(_.values($('a')), (element) => {
                    if (element.attribs) {
                        return element.attribs.href;
                    }
                }).filter((url) => {
                    if (url && url.includes('/release/') && !url.includes('/sell/release/') && !url.includes('/release/add')) {
                        return url;
                    }
                });
                // Make links unique
                result = await result.filter((elem, pos) => {
                    if (result.indexOf(elem) == pos) {
                        fs.appendFileSync('./urls', `${elem}\n`);
                        return elem;
                    }
                });
                // Concat all urls (from all decades)
                urls = urls.concat(result);
                console.log(result.length);
            }
            done();
        }
    });
    await c.queue(listOfUrl);
    setTimeout(async () => {
        // Remove duplicates
        urls = await urls.filter((url, pos) => {
            if (urls.indexOf(url) == pos)
                return url;
        });

        url[country === 'Serbia' ? 'rsURLs' : 'yuURLs'] = urls;
        await url.save();
        console.log('URLs size:', urls.length);
    }, 40 * 10000); //100s , za 40*10000 za yu (sad je za yu)
}

//// getURLs(RS); // this is done
//// getURLs(YU); // this is done

const getURL = async () => {
    try {
        const url = await Url.findOne();
        if (url) {
            return url;
        } else {
            const url = new Url({
                rsURLs: [],
                yuURLs: []
            });
            return await url.save();
        }
    } catch (error) {
        console.log(error)
    }
}

const test = async (country) => {
    console.log(`Test (${(country === RS ? 10142 : 41815)}): ${(await getURL())[country === RS ? 'rsURLs' : 'yuURLs'].length}`);
};
// test(RS);

/**********************************Scraping**************************************/
const hmsToSeconds = (time) => {
    var p = time.split(':'),
        s = 0,
        m = 1;
    while (p.length > 0) {
        s += m * parseInt(p.pop(), 10);
        m *= 60;
    }
    return s;
}

const scrape = async (url, country) => {
    return new Promise((resolve, reject) => {
        const c = new Crawler({
            maxConnections: 10,
            rateLimit: 250,
            callback: async (error, res, done) => {
                try {
                    if (error) {
                        console.log(error);
                        reject(error);
                    } else {
                        if (res.req.path === '/Etu%C5%A1ka-Poljakovi%C4%87-Milica-Manojlovi%C4%87-Narodne-Igre-Jugoslavije/release/3525342' || res.req.path === '/Etu%C5%A1ka-Poljakovi%C4%87-Narodne-Igre-Jugoslavije-Centralna-I-Zapadna-Srbija/release/3525434' || res.req.path === '/Etu%C5%A1ka-Poljakovi%C4%87-Narodne-Igre-Jugoslavije-Crna-Gora/release/3525504' || res.req.path === '/Etu%C5%A1ka-Poljakovi%C4%87-Narodne-Igre-Jugoslavije-Vojvodina-Nacionalnosti-Kosovo/release/3525381') {
                            console.log('Blac List', res.req.path);

                        } else {

                            const $ = res.$;
                            // 1. get number of the page
                            let profile = $('.profile')[0];
                            // console.log('profile',profile)

                            const artists = Object.values($('#profile_title').find('a'))
                                .filter(artist => artist && artist.children && artist.children[0])
                                .map(artist => artist.children[0].data)

                            let titleObject = $('#profile_title');
                            for (let i = 0; i < artists.length; i++) {
                                titleObject = titleObject.children().last();
                            }
                            let title = titleObject[0].children[0].data.trim()
                            // contents[0].children[1].children[0].data.trim();


                            console.log('Artists:', artists);
                            console.log('Title: ', title);
                            console.log('\n')

                            let contents = $('.content');
                            let released = '';
                            let offset = 0;
                            if (contents.length === 7) {
                                offset = 1;
                            }

                            // Negde imamo series i to nam kvari posao
                            if (contents[3].children[1]) {
                                released = contents[3 + offset].children[1].children[0].data.trim();
                            }
                            // console.log('1', contents[1].children[1].children[0].data.trim());

                            // console.log('hej', contents.text());
                            let format = $('.profile').text().replace(/\  /g, '').replace(/\n/g, '');
                            format = format.slice(format.indexOf('Format:') + 7, format.indexOf('Country:'));

                            // console.log('2', contents[2].children[1].children[0].data.trim());
                            // console.log('3', contents[3].children[1].children[0].data.trim());
                            // console.log('4', contents[4].children[1].children[0].data.trim());
                            // console.log('5', contents[5].children[1].children[0].data.trim());
                            // console.log('6', contents[6].children[1].children[0].data.trim());

                            // 1 Vajdasági Táncháztalálkozó
                            // 2 CD
                            // 3 Serbia
                            // 4 2004
                            // 5 Folk, World, & Country
                            // 6 Folk

                            // 1 CD
                            // 2 Serbia
                            // 3 2010
                            // 4 Pop
                            // 5 Ballad

                            genre = contents[4 + offset].children.filter(child => child.name === 'a').map(a => a.children[0].data.trim());

                            style = contents[5 + offset].children.filter(child => child.name === 'a').map(a => a.children[0].data.trim())


                            const trackList = Object.values($('.tracklist_track_title[itemprop=name]'));
                            const tracks = trackList
                                .filter(track => track && track.children && track.children[0] && track.children[0].data)
                                .map(track => {
                                    // console.log(track.children)
                                    return {
                                        song: track.children[0].data,
                                        duration: 0
                                    }
                                });


                            // DURATION
                            const dutartionList = Object.values($('.tracklist_track_duration'));
                            const durations = dutartionList
                                .filter(duration => duration && duration.children && duration.children[3] && duration.children[3].children[0])
                                .map((duration, index) => {
                                    if (tracks[index]) {
                                        tracks[index].duration = hmsToSeconds(duration.children[3].children[0].data)
                                    }
                                });

                            const trackListCredits = Object.values($('.tracklist_track_title'));

                            if (durations.length !== 0 && durations.length !== tracks.length) {
                                console.error(`Duratian and track are not the same for this url: ${res.req.path}`);
                            }

                            // Credits
                            let allCredits = {};
                            const inlineCredits = trackListCredits
                                .filter(track => track.children && track.children[2])
                                .map(track => {
                                    if (track.children && track.children[2]) {
                                        return track.children[2].children.map(credits => {
                                            const first = credits.children[0].data.replace('–', '').trim().split(',');
                                            let second = [];
                                            if (credits.children[1]) {
                                                // second = credits.children[1].children[0].data
                                                for (let i = 0; i < credits.children.length; i++) {
                                                    if (credits.children && credits.children[i] && credits.children[i].children && credits.children[i].children[0]) {
                                                        second.push(credits.children[i].children[0].data)
                                                    }
                                                }
                                            }
                                            first.forEach(f => {
                                                f = f.trim();
                                                // allCredits[f] = allCredits[f] ? allCredits[f].add(second) : new Set([second])
                                                second.forEach(s => {
                                                    allCredits[f] = allCredits[f] ? allCredits[f].add(s) : new Set([s])
                                                });
                                            });
                                            return first + second
                                        });
                                    }
                                });
                            // console.log(allCredits)

                            const creditsObject = Object.values($('.role'));
                            creditsObject
                                .filter(credit => credit && credit.children && credit.children[0] && credit.next)
                                .map(credit => {
                                    const first = credit.children[0].data.trim().split(',');
                                    let second = [];
                                    let third = '';
                                    t = credit.next.next;
                                    if (t) {
                                        second = [t.children[0].data];
                                        while (t.next.next) {
                                            t = t.next.next;
                                            second.push(t.children[0].data);
                                        }
                                        third = credit.next.next.next.data.trim()
                                    } else {
                                        console.log("OPA")
                                        second = [credit.next.data.replace(/\s/g, '').replace('–', '')]
                                    }

                                    first.forEach(f => {
                                        f = f.trim();
                                        second.forEach(s => {
                                            allCredits[f] = allCredits[f] ? allCredits[f].add(s) : new Set([s])
                                        });
                                    });
                                    // console.log(second);
                                    // console.log(`1: ${first} 2: ${second} 3: ${third}`)
                                    // return `${first}  ${second}  ${third}`.trim()
                                });

                            // Switch Set to Array
                            Object.keys(allCredits).forEach(key => allCredits[key] = [...allCredits[key]]);

                            // console.log('Temp 2', temp['Arranged By'].values());
                            // console.log('=======================');

                            const versionsString = $('.m_versions').children().first().text();
                            const versions = 1 + (versionsString ?
                                parseInt(versionsString.slice(versionsString.indexOf('of ') + 3, versionsString.indexOf(')'))) : 0);

                            // console.log(versions);

                            // console.log(gender);
                            // $("[attribute=value]")
                            // const label = profile.[0].children[2]
                            // console.log(label);

                            const album = new Album({
                                artists,
                                title,
                                country: country || 'Serbia',
                                genre,
                                released,
                                style,
                                tracks,
                                format,
                                versions,
                                credits: allCredits,
                                url: res.req.path
                            });
                            // console.log(album)
                            // resolve(album);
                            await album.save();
                        }
                    }

                    done();
                } catch (error) {
                    console.error('GRSKICA', res.req.path);
                    console.error(error)
                }
            }
        });
        c.queue(url);
    });
}

const scrapeData = [
    'https://www.discogs.com/Cvija-I-Rasta-One-I-Lova/release/2210935',
    'https://www.discogs.com/Riverroth-Infernal-Thrashing/release/12084759',
    'https://www.discogs.com/Cvija-Tajne/release/12010685',
    'https://www.discogs.com/Neme%C5%A1-Ne-mislim-bez-nje/release/12180687',
    'https://www.discogs.com/Boban-Rajovi%C4%87-Dito/release/12046909',
    'https://www.discogs.com/Aja-Zverka/release/12175740',
    'https://www.discogs.com/Marina-Viskovi%C4%87-Hiljadu-Lica/release/12175560',
    'https://www.discogs.com/%D0%91%D0%B0%D1%98%D0%B0-%D0%9C%D0%B0%D0%BB%D0%B8-%D0%9A%D0%BD%D0%B8%D0%BD%D1%9F%D0%B0-%D0%9E%D1%80%D0%BA%D0%B5%D1%81%D1%82%D0%B0%D1%80-%D0%92%D0%BB%D0%B0%D0%B4%D0%B5-%D0%A2%D0%BE%D0%B4%D0%BE%D1%81%D0%B8%D1%98%D0%B5%D0%B2%D0%B8%D1%9B%D0%B0-%D0%9D%D0%B5-%D0%94%D0%B0%D0%BC-%D0%9A%D1%80/release/8940054',
    'https://www.discogs.com/Partenaire-A-Blue-Rose-EP/release/9518274',
    'https://www.discogs.com/%D0%9D%D1%83%D0%BB%D0%B0-%D0%9D%D1%83%D0%BB%D0%B0/release/7462435',
    'https://www.discogs.com/%D0%A1%D0%B0%D1%88%D0%B0-%D0%A2%D1%80%D0%B0%D1%98%D0%BA%D0%BE%D0%B2%D0%B8%D1%9B-%D0%9F%D0%BE%D0%B4%D1%83%D1%85%D0%B2%D0%B0%D1%82-%D0%A1%D0%B5%D1%80%D0%B1%D0%BE%D0%BD-%D0%94%D1%83%D0%B3%D0%B5-%D0%9D%D0%BE%D1%9B%D0%B8-%D0%A6%D1%80%D0%BD%D0%B5-%D0%97%D0%B0%D1%81%D1%82%D0%B0%D0%B2%D0%B5-/release/7254303',
    'https://www.discogs.com/%D0%A1%D0%BF%D0%BE%D0%BC%D0%B5%D0%BD%D0%BA%D0%B0-%D0%A2%D0%B8-%D0%B7%D0%BD%D0%B0%D1%88/release/9870206',
    'https://www.discogs.com/Mitar-%C5%A0aban-Ja%C5%A1ar-Mile-4-Kralja/release/11276491'
]
let TEST = false;

const testScrape = async () => {
    if (TEST) {
        // await scrape(scrapeData);

        await scrape('https://www.discogs.com/Etu%C5%A1ka-Poljakovi%C4%87-Milica-Manojlovi%C4%87-Narodne-Igre-Jugoslavije/release/3525342');

        // await scrape('https://www.discogs.com/Smak-Antologija/release/10938168');
        // await scrape('https://www.discogs.com/Aco-Pejovi%C4%87-Aco-Pejovi%C4%87/release/3971983');
        // await scrape('https://www.discogs.com/Amadeus-Band-Platinum-Collection/release/2697359');


        // await scrape('https://www.discogs.com/Various-9-Vajdas%C3%A1gi-T%C3%A1nch%C3%A1ztal%C3%A1lkoz%C3%B3/release/11900997');
        // await scrape('https://www.discogs.com/Boban-Rajovi%C4%87-Dito/release/12046909');
        // await scrape('https://www.discogs.com/Cvija-Tajne/release/12010685');
        // await scrape('https://www.discogs.com/%D0%94%D0%B0%D0%B6%D0%B4-%D0%9D%D0%B0%D0%B6%D0%B8%D0%B2%D0%BE/release/2438185');
        // await scrape('https://www.discogs.com/Neme%C5%A1-Ne-mislim-bez-nje/release/12180687');
    } else {
        const url = await getURL();
        const albums = (await Album.find()).map(a => `https://www.discogs.com${a.url}`);
        const listRS = url.rsURLs.map(u => `https://www.discogs.com${u}`);
        const listYU = url.yuURLs.map(u => `https://www.discogs.com${u}`);
        const list = listRS.concat(listYU); // TODO nekako ubaci lepo

        const urls = await _.difference(list, albums);

        console.log(`${urls.length} + ${albums.length} = ${urls.length + albums.length} / ${list.length}`);

        console.log('Start scraping ', urls.length);
        await scrape(urls, YU);

    }
}
// testScrape();

const checkReleased = async () => {
    const as = await Album.find();
    console.log(as.length);
    as.map(a => {
        console.log('x', a.released)
    })
};

// duration test: /%D0%91%D0%B8%D1%86%D0%B8%D0%BA%D0%BB-%D0%A7%D1%80%D1%8A%D1%82%D0%B0%D0%BC%D0%B8-%D0%A0%D1%A3%D0%B7%D0%B0%D0%BC%D0%B8/release/7097474

// { url : "/%D0%91%D0%B5%D0%BE%D0%B3%D1%80%D0%B0%D0%B4%D1%81%D0%BA%D0%B8-%D0%A1%D0%B8%D0%BD%D0%B4%D0%B8%D0%BA%D0%B0%D1%82-%D0%A1%D0%B2%D0%B8-%D0%97%D0%B0%D1%98%D0%B5%D0%B4%D0%BD%D0%BE/release/10927188" }
/*
Serbia
2010 - 7540
2000 - 2526
1990 - 76
= Total  10142

Yugo
2010 - 2+
2000 - 1716+
1990 - 6386+
1980 - 13862+
1970 - 14498+
1960 - 4764+
1950 - 582+
1940 - 21+
1930 - 14+
1920 - 14
= Total 41815
URLs size: 41859 (41856)
 */


// 8k iz srbije
// 43 iz yu33