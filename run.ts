// -*- coding: utf-8 -*-

// Notes:
//   - All of Norvig's original numbers were from 2002
//   - Any numbers without a citation are from Norvig's article:
//       http://norvig.com/21-days.html#answers
//   - Exponential functions have the form:
//       y = a*b^x
//   - raising 2^2012 causes overflow, so we index year by (year - 1982)
//     (82 was the year the PC came out)
// TODO: get more accurate doubling rates from Aurojit Panda's
//       spreadsheet: http://www.eecs.berkeley.edu/~rcs/research/hw_trends.xlsx

const stepTime = 4000; // sync with --stepTime in CSS

var year = new Date().getFullYear();
function shift(year) {
    return year - 1982;
}
function getPayloadBytes() {
    // 1 MB
    return Math.pow(10, 6);
}
function getNetworkPayloadBytes() {
    // 2KB
    return 2 * Math.pow(10, 3);
}
function getCycle() {
    // Clock speed stopped at ~3GHz in ~2005
    // [source: http://www.kmeme.com/2010/09/clock-speed-wall.html]
    // Before then, doubling every ~2 years
    // [source: www.cs.berkeley.edu/~pattrsn/talks/sigmod98-keynote.ppt]
    if (year <= 2005) {
        // 3*10^9 = a*b^(2005-1990)
        // b = 2^(1/2)
        // -> a = 3*10^9 / 2^(2005.5)
        var a = 3 * Math.pow(10, 9) / Math.pow(2, shift(2005) * 0.5);
        var b = Math.pow(2, 1.0 / 2);
        var hz = a * Math.pow(b, shift(year));
    } else {
        var hz = 3 * Math.pow(10, 9);
    }
    //  1 / HZ = seconds
    //  1*10^9 / HZ = ns
    var ns = Math.pow(10, 9) / hz;
    return ns;
}
function getMemLatency() {
    // Bus Latency is actually getting worse:
    // [source: http://download.micron.com/pdf/presentations/events/winhec_klein.pdf]
    // 15 years ago, it was decreasing 7% / year
    // [source: www.cs.berkeley.edu/~pattrsn/talks/sigmod98-keynote.ppt]
    if (year <= 2000) {
        // b = 0.93
        // 100ns = a*0.93^2000
        /// -> a = 100 / 0.93^2000
        var b = 0.93;
        var a = 100.0 / Math.pow(0.93, shift(2000));
        var ms = a * Math.pow(b, shift(year));
    } else {
        var ms = 100; // ns
    }
    return ms;
}
function getNICTransmissionDelay(payloadBytes) {
    // NIC bandwidth doubles every 2 years
    // [source: http://ampcamp.berkeley.edu/wp-content/uploads/2012/06/Ion-stoica-amp-camp-21012-warehouse-scale-computing-intro-final.pdf]
    // TODO: should really be a step function
    // 1Gb/s = 125MB/s = 125*10^6 B/s in 2003
    // 125*10^6 = a*b^x
    // b = 2^(1/2)
    // -> a = 125*10^6 / 2^(2003.5)
    var a = 125 * Math.pow(10, 6) / Math.pow(2, shift(2003) * 0.5);
    var b = Math.pow(2, 1.0 / 2);
    var bw = a * Math.pow(b, shift(year));
    // B/s * s/ns = B/ns
    var ns = payloadBytes / (bw / Math.pow(10, 9));
    return ns;
}
function getBusTransmissionDelay(payloadBytes) {
    // DRAM bandwidth doubles every 3 years
    // [source: http://ampcamp.berkeley.edu/wp-content/uploads/2012/06/Ion-stoica-amp-camp-21012-warehouse-scale-computing-intro-final.pdf]
    // 1MB / 250,000 ns = 10^6B / 0.00025 = 4*10^9 B/s in 2001
    // 4*10^9 = a*b^x
    // b = 2^(1/3)
    // -> a = 4*10^9 / 2^(2001.33)
    var a = 4 * Math.pow(10, 9) / Math.pow(2, shift(2001) * 0.33);
    var b = Math.pow(2, 1.0 / 3);
    var bw = a * Math.pow(b, shift(year));
    // B/s * s/ns = B/ns
    var ns = payloadBytes / (bw / Math.pow(10, 9));
    return ns;
}
function getSSDLatency() {
    // Will flat-line in one capacity doubling cycle (18 months=1.5years)
    // Before that, 20X decrease in 3 doubling cycles (54 months=4.5years)
    // Source: figure 4 of http://cseweb.ucsd.edu/users/swanson/papers/FAST2012BleakFlash.pdf
    // 20 us = 2*10^4 ns in 2012
    // b = 1/20 ^ 1/4.5
    // -> a = 2*10^4 / 1/20 ^(2012 * 0.22)
    if (year <= 2014) {
        var a = 2 * Math.pow(10, 4) / Math.pow(1.0 / 20, shift(year) * 0.22);
        var b = Math.pow(1.0 / 20, 1.0 / 4.5);
        return a * Math.pow(b, shift(year));
    } else {
        return 16000;
    }
}
function getSSDTransmissionDelay(payloadBytes) {
    // SSD bandwidth doubles every 3 years
    // [source: http://ampcamp.berkeley.edu/wp-content/uploads/2012/06/Ion-stoica-amp-camp-21012-warehouse-scale-computing-intro-final.pdf]
    // 3GB/s = a*b^2012
    // b = 2^(1/3)
    // -> a = 6*10^9 / 2^(2012.33)
    var a = 3 * Math.pow(10, 9) / Math.pow(2, shift(2012) * 0.33);
    var b = Math.pow(2, 1.0 / 3);
    var bw = a * Math.pow(b, shift(year));
    // B/s * s/ns = B/ns
    var ns = payloadBytes / (bw / Math.pow(10, 9));
    return ns;
}
function getSeek() {
    // Seek + rotational delay halves every 10 years
    // [source: http://www.storagenewsletter.com/news/disk/hdd-technology-trends-ibm]
    // In 2000, seek + rotational =~ 10 ms
    // b = (1/2)^(1/10)
    // -> a = 10^7 / (1/2)^(2000*0.1)
    var a = Math.pow(10, 7) / Math.pow(0.5, shift(2000) * 0.1);
    var b = Math.pow(0.5, 0.1);
    var ns = a * Math.pow(b, shift(year));
    return ns;
}
function getDiskTransmissionDelay(payloadBytes) {
    // Disk bandwidth is increasing very slowly -- doubles every ~5 years
    // [source: http://ampcamp.berkeley.edu/wp-content/uploads/2012/06/Ion-stoica-amp-camp-21012-warehouse-scale-computing-intro-final.pdf]
    // Before 2002 (~100MB/s):
    // Disk bandwidth doubled every two years
    // [source: www.cs.berkeley.edu/~pattrsn/talks/sigmod98-keynote.ppt]
    if (year <= 2002) {
        // 100MB/s = a*b^2002
        // b = 2^(1/2)
        // -> a = 10^8 / 2^(2002.5)
        var a = Math.pow(10, 8) / Math.pow(2, shift(2002) * 0.5);
        var b = Math.pow(2, 1.0 / 2);
        var bw = a * Math.pow(b, shift(year));
    } else {
        // 100MB/s = a*b^2002
        // b = 2^(1/5)
        // -> a = 10^8 / 2^(2002-1982 * .2)
        var a = Math.pow(10, 8) / Math.pow(2, shift(2002) * 0.2);
        var b = Math.pow(2, 1.0 / 5);
        var bw = a * Math.pow(b, shift(year));
    }
    // B/s * s/ns = B/ns
    var ns = payloadBytes / (bw / Math.pow(10, 9));
    return ns;
}
function getDCRTT() {
    // Assume this doesn't change much?
    return 500000; // ns
}
function getWanRTT() {
    // Routes are arguably improving:
    //   http://research.google.com/pubs/pub35590.html
    // Speed of light is ultimately fundamental
    return 150000000; // ns
}

// Display functions:

const SINGLE_BOX_SIZE = 30;  // in pixels
const GRID_SIZE = 10; // Number of boxes across and down in big grid.

function makeBoxes(n, color) {
    var gw = SINGLE_BOX_SIZE * GRID_SIZE;  // Max with of grid
    var gh = Math.floor(n / GRID_SIZE) * SINGLE_BOX_SIZE;  // Height of grid
    if ((n % GRID_SIZE) != 0) {
        gh += SINGLE_BOX_SIZE;
    }
    var rects = d3.create("svg:svg").
        attr("height", gh);

    var maxWidth = 0;
    outerLoop:
    for (var y = 0; y < gh; y += SINGLE_BOX_SIZE) {
        for (var x = 0; x < gw; x += SINGLE_BOX_SIZE) {
            if (n > 0 && n < 1) {
                var width = n * SINGLE_BOX_SIZE;
            } else {
                var width = SINGLE_BOX_SIZE;
            }
            maxWidth = Math.max(maxWidth, x + width);
            rects.append("svg:rect").
                attr("x", x).
                attr("y", y).
                attr("height", SINGLE_BOX_SIZE).
                attr("width", width).
                attr("style", color);

            n -= 1;
            if (n <= 0) {
                break outerLoop;
            }
        }
    }
    rects.attr("width", maxWidth)
    return rects;
}

var black = "stroke:#FFFFFF; fill: #000000";
var blue = "stroke:#FFFFFF; fill: #0000FF";
var green = "stroke:#FFFFFF; fill: #00CC00";
var red = "stroke:#FFFFFF; fill: #FF0000";

var numberFormat = new Intl.NumberFormat('en', { maximumFractionDigits: 0 });
function formatNumber(n) {
    return numberFormat.format(n)
}

var units = ['ns', 'μs', 'ms', 's'];
var colors = [black, blue, green, red];

function Metric(ns, caption, forceDownOne) {
    this.ns = ns;
    this.forceDownOne = forceDownOne;
    // Diagrams jump up by factors of 100, starting with 1ns as smallest
    // (e.g. 1ns, 100ns, 10μs etc.)
    var drawingScale = Math.min(Math.floor(Math.log10(ns) / Math.log10(GRID_SIZE * GRID_SIZE)), colors.length - 1);
    if (forceDownOne) {
        // Used to draw 100 squares of smaller size, which will morph
        // into 1 square representing larger unit.
        drawingScale -= 1;
    }
    var unitScale = Math.floor(Math.log10(ns) / 3);
    var nearestUnit = units[unitScale];
    this.color = colors[drawingScale];
    this.boxes = ns / (100 ** drawingScale);
    var inUnit = ns / (1000 ** unitScale)
    var unitDisplay = formatNumber(inUnit) + " " + nearestUnit;
    var nsDisplay = '';
    if (nearestUnit != "ns") {
        nsDisplay = " = " + formatNumber(Math.round(inUnit) * (1000 ** unitScale)) + " ns";
    }
    this.displayString = (caption + unitDisplay + nsDisplay);
}

function getMetrics() {
    var ns = new Metric(1, "", false);
    // Source for L1: http://cache.freescale.com/files/32bit/doc/app_note/AN2180.pdf
    var L1 = new Metric(3 * getCycle(), "L1 cache reference: ", false);
    var branch = new Metric(10 * getCycle(), "Branch mispredict: ", false);
    // Source for L2: http://cache.freescale.com/files/32bit/doc/app_note/AN2180.pdf
    var L2 = new Metric(13 * getCycle(), "L2 cache reference: ", false);
    var mutex = new Metric(50 * getCycle(), "Mutex lock/unlock: ", false);
    var ns_100 = new Metric(100, "", true);
    var ns100 = new Metric(100, "", false);
    var mem = new Metric(getMemLatency(), "Main memory reference: ", false);
    var micro = new Metric(100 * 10, "", false);
    var snappy = new Metric(6000 * getCycle(), "Compress 1KB wth Snappy: ", false);
    var ns100_100 = new Metric(100 * 100, "", true);
    var tenMicro = new Metric(100 * 100, "", false);
    var network = new Metric(getNICTransmissionDelay(getNetworkPayloadBytes()), "Send " + formatNumber(getNetworkPayloadBytes()) + " bytes over commodity network: ", false);
    var ssdRandom = new Metric(getSSDLatency(), "SSD random read: ", false);
    var mbMem = new Metric(getBusTransmissionDelay(getPayloadBytes()),
        "Read " + formatNumber(getPayloadBytes()) + " bytes sequentially from memory: ", false);
    var rtt = new Metric(getDCRTT(), "Round trip in same datacenter: ", false);
    var tenMicro_100 = new Metric(100 * 100 * 100, "", true);
    var ms = new Metric(100 * 100 * 100, "", false);
    var mbSSD = new Metric(getSSDTransmissionDelay(getPayloadBytes()),
        "Read " + formatNumber(getPayloadBytes()) + " bytes sequentially from SSD: ", false);
    var seek = new Metric(getSeek(), "Disk seek: ", false);
    var mbDisk = new Metric(getDiskTransmissionDelay(getPayloadBytes()),
        "Read " + formatNumber(getPayloadBytes()) + " bytes sequentially from disk: ", false);
    var wan = new Metric(getWanRTT(), "Packet roundtrip CA to Netherlands: ", false);
    var metrics = [
        ns, L1, branch, L2, mutex, ns_100, ns100, mem, micro, snappy, ns100_100, tenMicro, network,
        ssdRandom, mbMem, rtt, tenMicro_100, ms, mbSSD, seek, mbDisk, wan
    ];
    return metrics;
}

function render() {
    var metrics = getMetrics();
    metrics.sort((a, b) => a.ns == b.ns ? (b.forceDownOne - a.forceDownOne) : (a.ns - b.ns));
    var $container = d3.select('#container');

    // Build the HTML
    metrics.forEach(function(metric, i) {
        $container.append("div").attr("class", "metric hidden").attr("data-number", i).each(function(n, j) {
            var $this = d3.select(this);
            $this.append("div").attr("class", "boxes").append(() => makeBoxes(metric.boxes, metric.color).node());
            $this.append("div").attr("class", "caption").text(metric.displayString);
        });
    });
    metrics.forEach(function(metric, i) {
        // We use 90% of this value to allow overlap
        setTimeout(function() {
            var classes = '';
            if (i == metrics.length - 1) {
                classes = 'last';
            } else {
                if (metric.forceDownOne) {
                    classes = 'shrink';
                }
            }
            d3.select(`.metric[data-number="${i}"]`).attr('class', 'metric show ' + classes);
        }, i * stepTime * 0.90);
    });

};
render();

