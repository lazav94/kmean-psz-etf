# Crawler, Scraper Music Website and use KMeans <img src="http://neurel.etf.bg.ac.rs/NEUREL%202014/Master/images/sponzori/etf.gif" alt="etf" width="40px"/>

## Intro

Project specification: PSZ_Projekat_2018.pdf
[Application](https://pszetf.herokuapp.com)
**DO NOT CLICK CALCULATE ON HEROKU (HEROKU USE ONLY 512MB RAM)**

I Phase
---
**Result (database files .csv)**

- [albums.csv](https://github.com/lazav94/kmean-psz-etf/blob/master/albums.csv) (can be downloaded from app)

- [stats.csv](https://github.com/lazav94/kmean-psz-etf/blob/master/stats.csv)

- [urls.csv](https://github.com/lazav94/kmean-psz-etf/blob/master/url.csv)

**Code**

- [crawler.js](https://github.com/lazav94/kmean-psz-etf/blob/master/server/controllers/crawler.js)

II Phase
---
**Result**

- [TABLES](https://pszetf.herokuapp.com)

**Code**
- [query.js](https://github.com/lazav94/kmean-psz-etf/blob/master/server/controllers/query.js)

III Phase
---
**Result**

- [GRAPHS](https://pszetf.herokuapp.com)

### Code

- [query.js](https://github.com/lazav94/kmean-psz-etf/blob/master/server/controllers/query.js)

IV Phase
---
**Result**

- in ***results*** folder - format: PARAM-#CLUSTER-CLUSTER-DATE

- [KMERS](https://pszetf.herokuapp.com/kmeans)

**Code**

- [kmeans.js](https://github.com/lazav94/kmean-psz-etf/blob/master/server/controllers/kmeans.js)

- [routes.js](https://github.com/lazav94/kmean-psz-etf/blob/master/server/routes.js)


**DO NOT CLICK CALCULATE ON HEROKU (HEROKU USE ONLY 512MB RAM)**

## Instaling and Running
```
expand RAM memory: node  --max_old_space_size=4096   ./ ./server/ ./server/controllers/*
npm i
run #1: nodemon
run #2: node server
run #3: npm run start
```

## Technologies
```
Node.js
Mongo DB
JQuery
CSS
HTML
```

## TODO
- [ ] Improve frontend
- [ ] Use more parameters for clustering
- [ ] Optimize code

