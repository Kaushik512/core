$(function() {

    Morris.Area({
        element: 'morris-area-chart',
        data: [{
            period: '2012 ',
            AWS: 2666,
            AZZURE: null,
            RL: 2647
        }, {
            period: '2012 Q2',
            AWS: 2778,
            AZZURE: 2294,
            RL: 2441
        }, {
            period: '2012 Q3',
            AWS: 4912,
            AZZURE: 1969,
            RL: 2501
        }, {
            period: '2012 Q4',
            AWS: 3767,
            AZZURE: 3597,
            RL: 5689
        }, {
            period: '2013 Q1',
            AWS: 6810,
            AZZURE: 1914,
            RL: 2293
        }, {
            period: '2013 Q2',
            AWS: 5670,
            AZZURE: 4293,
            RL: 1881
        }, {
            period: '2013 Q3',
            AWS: 4820,
            AZZURE: 3795,
            RL: 1588
        }, {
            period: '2013 Q4',
            AWS: 15073,
            AZZURE: 5967,
            RL: 5175
        }, {
            period: '2014 Q1',
            AWS: 10687,
            AZZURE: 4460,
            RL: 2028
        }, {
            period: '2014 Q2',
            AWS: 8432,
            AZZURE: 5713,
            RL: 1791
        }],
        xkey: 'period',
        ykeys: ['AWS', 'AZZURE', 'RL'],
        labels: ['AWS', 'AZZURE', 'RL'],
        pointSize: 2,
        hideHover: 'auto',
        resize: true
    });

    Morris.Donut({
        element: 'morris-donut-chart',
        data: [{
            label: "Download Sales",
            value: 12
        }, {
            label: "In-Store Sales",
            value: 30
        }, {
            label: "Mail-Order Sales",
            value: 20
        }],
        resize: true
    });

    Morris.Bar({
        element: 'morris-bar-chart',
        data: [{
            y: '2006',
            a: 100,
            b: 90
        }, {
            y: '2007',
            a: 75,
            b: 65
        }, {
            y: '2008',
            a: 50,
            b: 40
        }, {
            y: '2009',
            a: 75,
            b: 65
        }, {
            y: '2010',
            a: 50,
            b: 40
        }, {
            y: '2011',
            a: 75,
            b: 65
        }, {
            y: '2012',
            a: 100,
            b: 90
        }],
        xkey: 'y',
        ykeys: ['a', 'b'],
        labels: ['Series A', 'Series B'],
        hideHover: 'auto',
        resize: true
    });

});
