const perf = require('execution-time')();
const _ = require('lodash');
const moment = require('moment');
const Album = require('../models/album.model');
const Stats = require('../models/stats.model');

module.exports = getStats = async () => {
    try {
        const stats = await Stats.findOne();
        if (stats) {
            return stats;
        } else {
            stats = new Stats();
            return await stats.save();
        }
    } catch (error) {
        console.log(error)
    }
}
/*************************Zadatak 2: Analiza podataka ***********************************/
// a) izlistati koliko zapisa pripada svakom od žanrova
// b) izlistati koliko zapisa pripada svakom od stilova
const getStyleNGenre = async () => {
    try {
        const albums = await Album.find();
        const styleCount = {},
            genreCount = {};
        await Promise.all(albums.map(album => {
            album.style.map(s => styleCount[s] = styleCount[s] ? styleCount[s] + 1 : 1);
            album.genre.map(g => genreCount[g] = genreCount[g] ? genreCount[g] + 1 : 1);
        }));

        // console.log(styleCount);
        const style = Object.keys(styleCount).map(key => ({
            [key]: styleCount[key]
        }));
        const genre = Object.keys(genreCount).map(key => ({
            [key]: genreCount[key]
        }));

        const stats = await getStats();
        stats.tables.style = style;
        stats.tables.genre = genre;
        await stats.save();
        console.log('Done: getting Style and Genders stats');
    } catch (error) {
        console.error(error);
    }
}


// c) prikazati rang listu prvih 10 albuma koji imaju najveći broj izdatih verzija (više albuma
// može deliti jedno mesto na rang listi, pa konačan broj albuma na listi može biti i veći
// od 10)
const albumsWithMostVersions = async () => {
    let albums = (await Album.find())
        .sort((a, b) => b.versions - a.versions)
        .map(album => {
            return {
                artist: album.artists.join(', '),
                title: album.title,
                genre: album.genre.join(', '),
                style: album.style.join(', '),
                versions: album.versions,
                url: `https://www.discogs.com${album.url}`,
                country: album.country,
                released: album.released,
                numberOfTracks: album.tracks.length
            }
        });

    let maxIndex = 0;
    let found = 0;
    for (let i = 1; i < albums.length; i++) {
        if (albums[i].versions != albums[i - 1].versions) {
            found++;
        }

        maxIndex++;
        // console.log(`${found} ${maxIndex} ${albums[i].versions} ${albums[i - 1].versions}`);
        if (found === 10) {
            break;
        }
    };
    const result = albums.slice(0, maxIndex);
    // console.log(result);

    const stats = await getStats();
    stats.tables.topVersions = result;
    await stats.save();
    console.log('Done: top 100 album with most versions');

}


// d) prikazati prvih 100 pesama koje se nalaze na najviše albuma, i osim broja albuma
// (COUNT), uz svaku pesmu napisati podatke o tim albumima (Format, Country,
// Year/Relased, Genre, Style)
const mostFreqSong = async () => {
    const albums = await Album.find();
    // console.log(`We have ${albums.length}`);
    let allSongs = {};
    albums.map(album => {
        album.tracks.map(track => {
            // const song = track.song.trim();
            allSongs[track.song] = allSongs[track.song] ? allSongs[track.song].add(album) : new Set([album])
        });
    });
    Object.keys(allSongs).forEach(key => allSongs[key] = [...allSongs[key]]);

    let topSongs = Object.keys(allSongs)
        .sort((a, b) => allSongs[b].length - allSongs[a].length)
        .slice(0, 100);
    // console.log(topSongs.length);


    // console.log(allSongs['Jedina'])
    const top100Songs = topSongs.map(song => {
        const albums = allSongs[song];
        return {
            [song]: albums.map(album => ({
                country: album.country,
                released: album.released,
                style: (album.style ? album.style.join(', ') : ''),
                genre: (album.genre ? album.genre.join(', ') : ''),
                url: `https://discogs.com${album.url}`,
                format: album.format

            }))
        };
    });

    // console.log(top100Songs.length);
    const stats = await getStats();
    stats.tables.topSongs = top100Songs;
    await stats.save();
    console.log('Done: Top 100 songs (most freq)');

}



// d) prikazati prvih 50 osoba koje imaju:
// ▪ najveći generalni rejting u pesmama (Credits)
// ▪ najviše učešća kao vokal (Vocals)
// ▪ najviše napisanih pesama (Writing & Arrangement)
const getMaxCredits = async () => {
    try {
        const creditsStack = {};
        let albums = await Album.find();
        albums = albums.filter(album => album.credits);
        // console.log(`We have ${albums.length} with credits`);


        // let allRoles = await Promise.all(albums.map(album => {
        //     return [].concat.apply([], Object.keys(album.credits))
        // }));
        // allRoles = [].concat.apply([], Object.values(allRoles));


        let all = [],
            vocals = [],
            wa = [];
        await Promise.all(albums.map(album => {
            all.push([].concat.apply([], Object.values(album.credits)));
            vocals.push([].concat.apply([], Object.values(album.credits.Vocals || [])));
            wa.push([].concat.apply([],
                Object.values(album.credits['Arranged By'] || []),
                Object.values(album.credits['Written - By'] || []),
                Object.values(album.credits['Written By'] || [])));
        }));

        all = [].concat.apply([], Object.values(all));
        vocals = [].concat.apply([], Object.values(vocals));
        wa = [].concat.apply([], Object.values(wa));

        allResult = {}, vocalsResult = {}, waResult = {};

        all.map(name => {
            return allResult[name] = allResult[name] ? allResult[name] + 1 : 1;
        });
        vocals.map(name => {
            return vocalsResult[name] = vocalsResult[name] ? vocalsResult[name] + 1 : 1;
        });
        wa.map(name => {
            return waResult[name] = waResult[name] ? waResult[name] + 1 : 1;
        });

        const sortedAll = Object.keys(allResult)
            .sort((a, b) => allResult[b] - allResult[a])
            .slice(0, 50)
            .map(k => ({
                [k.replace(/\./g, ';')]: allResult[k]
            }));

        const sortedVocals = Object.keys(vocalsResult)
            .sort((a, b) => vocalsResult[b] - vocalsResult[a])
            .slice(0, 50)
            .map(k => ({
                [k.replace(/\./g, ';')]: vocalsResult[k]
            }));
        const sortedWa = Object.keys(waResult)
            .sort((a, b) => waResult[b] - waResult[a])
            .slice(0, 50)
            .map(k => ({
                [k.replace(/\./g, ';')]: waResult[k]
            }));

        // console.log(sortedAll);
        // console.log(sortedVocals);
        // console.log(sortedWa);

        const stats = await getStats();
        stats.tables.allCredits = sortedAll;
        stats.tables.vocalsCredits = sortedVocals;
        stats.tables.waCredist = sortedWa;

        await stats.save();
        console.log('Done: Top 50 credits');

    } catch (error) {
        console.error(error);
    }
}

// TODO test !!!
// TODO Test what to do if song doesn't have duration
const decadeRation = async () => {
    let albums = await Album.find();
    const albumsSize = albums.length;
    const result = {
        'unknown': {
            count: 0,
            precentage: 0
        },
        '1950-': {
            count: 0,
            precentage: 0
        },
        '1950-1959': {
            count: 0,
            precentage: 0
        },
        '1960-1969': {
            count: 0,
            precentage: 0
        },
        '1970-1979': {
            count: 0,
            precentage: 0
        },
        '1980-1989': {
            count: 0,
            precentage: 0
        },
        '1990-1999': {
            count: 0,
            precentage: 0
        },
        '2000-2009': {
            count: 0,
            precentage: 0
        },
        '2010-2018': {
            count: 0,
            precentage: 0
        },
    };


    await Promise.all(albums.map(async album => {
        if (album.released) {
            let offset = 'unknown';
            const year = moment(album.released).year()
            // const released = parseInt(album.released)
            // require('fs').appendFileSync('relesed.txt', `${moment(album.released).year()}\n`);
            if (year < 1920) {
                offset = 'unknown';
            } else if (year < 1950) {
                offset = '1950-';
            }else if (year < 1960) {
                offset = '1950-1959';
            } else if (year < 1970) {
                offset = '1960-1969';
            } else if (year < 1980) {
                offset = '1970-1979';
            } else if (year < 1990) {
                offset = '1980-1989';
            } else if (year < 2000) {
                offset = '1990-1999';
            } else if (year < 2010) {
                offset = '2000-2009';
            } else if (year < 2019) {
                offset = '2010-2018';
            } else {
                console.error('Ovo ne bi trebalo da se desi ikada', year);
            }
            result[offset].count = result[offset].count + 1;
        } else {
            console.error("We doesn't have ${album._id}");
        }
    }));


    _.map(result, (r, index) => result[index].precentage = r.count / albumsSize);
    const stats = await getStats();
    stats.decade = result;
    await stats.save();
    // console.log(result);
    console.log('Done: Decade stats');
}



const cirylicRation = async () => {
    let albums = await Album.find();
    const albumsSize = albums.length;
    const result = {
        latin: {
            count: 0,
            precentage: 0
        },
        cyrillic: {
            count: 0,
            precentage: 0
        }
    };
    var Regex = require("regex");
    const regex = /[\u0400-\u04FF]/;


    await Promise.all(albums.map(album => {
        const lang = regex.test(album.title) ? 'cyrillic' : 'latin';
        result[lang].count = result[lang].count + 1;
    }));

    _.map(result, (r, index) => result[index].precentage = r.count / albumsSize);
    // console.log(result);

    const stats = await getStats();
    stats.cyrillic = result;
    await stats.save();
    console.log('Done: cyrilic');
}



// TODO Test what to do if song doesn't have duration
const durationRation = async () => {
    let albums = await Album.find();
    let tracksSize = 0;
    const result = {
        '0-90': {
            count: 0,
            precentage: 0
        },
        '91-180': {
            count: 0,
            precentage: 0
        },
        '181-240': {
            count: 0,
            precentage: 0
        },
        '241-300': {
            count: 0,
            precentage: 0
        },
        '301-360': {
            count: 0,
            precentage: 0
        },
        '360+': {
            count: 0,
            precentage: 0
        }
    };

    await Promise.all(albums.map(async album => {
        if (album.tracks) {
            tracksSize = tracksSize + album.tracks.length;
            await Promise.all(album.tracks.map(track => {
                const seconds = track.duration;
                let offset;
                if (seconds < 91) {
                    offset = '0-90'
                } else if (seconds < 181) {
                    offset = '91-180'
                } else if (seconds < 241) {
                    offset = '181-240'
                } else if (seconds < 301) {
                    offset = '241-300'
                } else if (seconds < 360) {
                    offset = '301-360'
                } else {
                    offset = '360+'
                }

                result[offset].count = result[offset].count + 1;
            }));
        } else {
            console.log('HEJ', album._id)
        }
    }));

    _.map(result, (r, index) => result[index].precentage = r.count / tracksSize);
    // console.log(result);
    const stats = await getStats();
    stats.duration = result;
    await stats.save();
    console.log('Done: duration stats');

}


const getGenreRatio = async () => {
    let albums = await Album.find();
    const albumsSize = albums.length;
    const result = {
        0: {
            count: 0,
            precentage: 0
        },
        1: {
            count: 0,
            precentage: 0
        },
        2: {
            count: 0,
            precentage: 0
        },
        3: {
            count: 0,
            precentage: 0
        },
        4: {
            count: 0,
            precentage: 0
        }
    };

    genreCount = {};

    await Promise.all(albums.map(album => {
        if (album.genre.length < 4) {
            result[album.genre.length].count = result[album.genre.length].count + 1;
        } else {
            result[4].count = result[4].count + 1;
        }
        album.genre.map(g => {
            genreCount[g] = genreCount[g] ? genreCount[g] + 1 : 1
        });
    }));
    // console.log(genreCount);

    const sortedGenreCount = Object.keys(genreCount)
        .sort((a, b) => genreCount[b] - genreCount[a])
        .slice(0, 6)
        .map(genre => ({
            [genre]: genreCount[genre]
        }));

    // console.log('First 6 genre:', sortedGenreCount);


    _.map(result, (r, index) => result[index].precentage = r.count / albumsSize);

    // console.log(result);

    const stats = await getStats();
    stats.genre = sortedGenreCount;
    stats.genreCount = result;
    await stats.save();
    console.log('Done: Top 6 genre stats');
}


const calculateStats = async () => {
    perf.start();
    console.log('Start calculating statistics ⌛');
    await Promise.all([
        // getStyleNGenre(),
        // albumsWithMostVersions(),
        // mostFreqSong(),
        // getMaxCredits(),
        // decadeRation(),
        // cirylicRation(),
        // durationRation(),
        // getGenreRatio()
    ]);
    console.log(perf.stop());

}
// calculateStats();

