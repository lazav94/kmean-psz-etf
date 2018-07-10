$(document).ready(function () {

//polarArea
    const loadDecadeChart = (data) => {

        const labels = Object.keys(data);
        const precentages = Object.values(data).map(d => d.precentage);
        const counts = Object.values(data).map(d => d.count);

        var ctx = document.getElementById("decadeChart").getContext('2d');
        var decadePieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels,
                datasets: [{
                    label: '# of albums',
                    data: counts,
                    backgroundColor: [
                        'rgba(0,0,0, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(255,0,0, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(66, 244, 75, 1)',
                        'rgba(233, 16, 237, 1)',
                        'rgba(155, 85, 10, 1)'
                    ],
                    // borderColor: [
                    //     'rgba(0,0,0, 1)',
                    //     'rgba(54, 162, 235, 1)',
                    //     'rgba(255, 206, 86, 1)',
                    //     'rgba(75, 192, 192, 1)',
                    //     'rgba(255,0,0, 1)',
                    //     'rgba(255, 159, 64, 1)',
                    //     'rgba(66, 244, 75, 1)',
                    //     'rgba(233, 16, 237, 1)',
                    //     'rgba(155, 85, 10, 1)'
                    // ],
                    // borderWidth: 1
                }]
            },
        });
    }

    const loadGenreChart = (data) => {
        const labels = [];
        const counts = [];
        data.forEach((g, i) => {
            labels[i] = Object.keys(g)[0];
            counts[i] = Object.values(g)[0];
        });

        var ctx = document.getElementById("genreChart").getContext('2d');
        var genrePieChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    label: '# of Albums',
                    data: counts,
                    backgroundColor: [
                        'rgba(255,0,0, 1)',
                        'rgba(66, 244, 75, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(233, 16, 237, 1)'
                    ]
                }]
            }
        });
    }

    const loadDurationChart = (data) => {
        const labels = Object.keys(data);
        const counts = Object.values(data).map(d => d.count);

        var ctx = document.getElementById("durationChart").getContext('2d');
        var genrePieChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    label: '# of Albums',
                    data: counts,
                    backgroundColor: [
                        'rgba(255,0,0, 1)',
                        'rgba(66, 244, 75, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(233, 16, 237, 1)'
                    ],
                }]
            }
        });
    }

    const loadCyrillicChart = (data) => {

        const labels = Object.keys(data).map(d => `${d.toUpperCase()} ${(100 * data[d].precentage).toFixed(2)}%`);
        const counts = Object.values(data).map(d => d.count);

        var ctx = document.getElementById("cyrillicChart").getContext('2d');
        var genrePieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels,
                datasets: [{
                    label: '# of Albums',
                    data: counts,
                    backgroundColor: [
                        'rgba(255,0,0, 1)',
                        'rgba(0,0,255, 1)'
                    ],
                }]
            }
        });
    }

    const loadGenreCountChart = (data) => {
        const labels = Object.keys(data).map(d => `#${d}: ${(100 * data[d].precentage).toFixed(2)}%`);

        const counts = Object.values(data).map(d => d.count);

        var ctx = document.getElementById("genreCountChart").getContext('2d');
        var genrePieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels,
                datasets: [{
                    label: '# of Albums',
                    data: counts,
                    backgroundColor: [
                        'rgba(0,0,0, 1)',
                        'rgba(66, 244, 75, 1)',
                        'rgba(153, 17, 255, 1)',
                        'rgba(233, 151, 13, 1)',
                        'rgba(255,0, 86, 1)'
                    ],
                }]
            }
        });
    }



    const configureCharts = (data) => {
        loadDecadeChart(data.decade);
        loadGenreChart(data.genre);
        loadDurationChart(data.duration);
        loadCyrillicChart(data.cyrillic);
        loadGenreCountChart(data.genreCount);
    }

    const getData = function (callback) {
        $.ajax({
            url: `/getdata`,
            method: 'get',
            success: callback,
            error: function (log) {
                console.error(log);
            }
        });
    };

    const loadCharts = () => {
        getData(function (data) {
            configureCharts(data);
        });
    };

    loadCharts();

    // loadCharts();
});