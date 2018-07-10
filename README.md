# Crawler, Scraper Music Website and use KMeans

## Intro

Project specification: PSZ_Projekat_2018.pdf

I Phase
    ### Result (database files .csv)
    - albums.csv (can be downloaded from app)
    - stats.csv
    - urls.csv
    ### Code
    crawler.js
II Phase
    ### Result
    [TABLES](https://pszetf.herokuapp.com)
    ### Code
    - query.js
III Phase
    ## Result
    [GRAPHS](https://pszetf.herokuapp.com)
    ### Code
    - query.js
IV Phase
    ### Result
    - in ***results*** folder - format: PARAM-#CLUSTER-CLUSTER-DATE
    - [KMERS](https://pszetf.herokuapp.com/kmeans)
    ### Code
    - kmers.js
    - routes.js
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
