const config = require('./config');
const os = require('os');

let deleteRequests = 0;
let getRequests = 0;
let postRequests = 0;
let putRequests = 0;
let activeUsers = 0;
let authAttempts = 0;
let failedAuthAttempts = 0;
let soldPizzas = 0;
let creationFailPizzas = 0;
let revenuePizzas = 0;
let endPointLatencies = []
let pizzaCreationLatencies = []


function requestTracker(req, res, next) {
    console.log('received request')
    console.log('req.method', req.method)
    switch (req.method) {
        case ('PUT'):
            putRequests += 1
            break;
        case ('DELETE'):
            deleteRequests += 1
            break;
        case ('POST'):
            postRequests += 1
            break;
        case ('GET'):
            getRequests += 1
            break;
    }
    next()
}

function timeTracker(req, res, next) {
    const startTime = Date.now();
    res.on("finish", () => {
        const endTime = Date.now();
        const totalTime = endTime - startTime
        endPointLatencies.push(constructMetric(LATENCY, totalTime, GAUGE, '1', {}, TYPE_DOUBLE))
    });
    next();
}

// metric names
const TOTAL_REQUESTS_PER_MINUTE = 'Req-per-minute-total'
const DELETE_REQUESTS_PER_MINUTE = 'Req-per-minute-delete'
const PUT_REQUESTS_PER_MINUTE = 'Req-per-minute-put'
const POST_REQUESTS_PER_MINUTE_ = 'Req-per-minute-post'
const GET_REQUESTS_PER_MINUTE = 'Req-per-minute-get'
const ACTIVE_USER_COUNT = 'number-active-users'
const AUTHENTICATION_ATTEMPTS = 'auth-attempts'
const AUTHENTICATION_FAILED_ATTEMPTS = 'failed-auth-attempts'
const MEMORY = 'memory-used'
const CPU = 'cpu-used'
const SOLD_PER_MINUTE = 'pizza-sold-per-minute'
const REVENUTE_PER_MINUTE = 'revenue-per-minute'
const CREATION_FAILURE = 'pizza-creation-failures'
const LATENCY = 'total-latency'
const PIZZA_REQ_LATENCY = 'pizza-req-latency'

// metric types
const GAUGE = 'gauge'
const COUNT = 'count'
const TYPE_DOUBLE = 'asDouble'
const TYPE_INT = 'asInt'
function constructMetric(metricName, metricValue, type, unit, attributes, data_type) {
    // attributes = { ...attributes, source: config.source };
    metric = {
        name: metricName,
        unit: unit,
        [type]: (type !== 'sum')
            ? {
                dataPoints: [
                    {
                        [data_type]: metricValue,
                        timeUnixNano: Date.now() * 1000000,
                        attributes: [
                            {
                                "key": "source",
                                "value": { "stringValue": config.metrics.source }
                            }
                        ],
                    },
                ],
            }
            : {
                dataPoints: [
                    {
                        [data_type]: metricValue,
                        timeUnixNano: Date.now() * 1000000,
                        attributes: [
                            {
                                "key": "source",
                                "value": { "stringValue": config.metrics.source }
                            }
                        ],
                    },
                ],
                aggregationTemporality: 'AGGREGATION_TEMPORALITY_CUMULATIVE',
                isMonotonic: true
            }
    }

    return metric
};


function getCpuUsagePercentage() {
    const cpuUsage = os.loadavg()[0] / os.cpus().length;
    return cpuUsage.toFixed(2) * 100;
}

function getMemoryUsagePercentage() {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsage = (usedMemory / totalMemory) * 100;
    return memoryUsage.toFixed(2);
}

function httpMetrics() {
    const requests = putRequests + postRequests + getRequests + deleteRequests
    metrics = [constructMetric(TOTAL_REQUESTS_PER_MINUTE, requests, GAUGE, '1', {}, TYPE_INT),
    constructMetric(PUT_REQUESTS_PER_MINUTE, putRequests, GAUGE, '1', {}, TYPE_INT),
    constructMetric(POST_REQUESTS_PER_MINUTE_, postRequests, GAUGE, '1', {}, TYPE_INT),
    constructMetric(GET_REQUESTS_PER_MINUTE, getRequests, GAUGE, '1', {}, TYPE_INT),
    constructMetric(DELETE_REQUESTS_PER_MINUTE, deleteRequests, GAUGE, '1', {}, TYPE_INT)]
    putRequests = 0
    postRequests = 0
    getRequests = 0
    deleteRequests = 0
    return metrics
}

function incrementActiveUsers() {
    activeUsers += 1;
}
function decrementActiveUsers() {
    activeUsers -= 1;
}
function incrementAuthAttempts() {
    authAttempts += 1;
}
function incrementFailedAuthAttempts() {
    failedAuthAttempts += 1;
}
function incrementSoldPizzas() {
    soldPizzas += 1;
}
function incrementFailedPizzas() {
    creationFailPizzas += 1;
}
function addRevenue(revenue) {
    revenuePizzas += revenue
}

function pizzaCreationLatencyTracking(totalTime) {
    console.log('pizzaCreationLatencyTracking', pizzaCreationLatencies)
    pizzaCreationLatencies.push(constructMetric(PIZZA_REQ_LATENCY, totalTime, GAUGE, '1', {}, TYPE_DOUBLE))
}

function userMetrics() {
    console.log('activeUsers', activeUsers)
    return [constructMetric(ACTIVE_USER_COUNT, activeUsers, GAUGE, '1', {}, TYPE_INT)]
}

function authMetrics() {
    metrics = [
        constructMetric(AUTHENTICATION_ATTEMPTS, authAttempts, GAUGE, '1', {}, TYPE_INT),
        constructMetric(AUTHENTICATION_FAILED_ATTEMPTS, failedAuthAttempts, GAUGE, '1', {}, TYPE_INT)
    ]
    authAttempts = 0
    failedAuthAttempts = 0
    return metrics
}

function systemMetrics() {
    return [
        constructMetric(MEMORY, getMemoryUsagePercentage(), GAUGE, '%', {}, TYPE_DOUBLE),
        constructMetric(CPU, getCpuUsagePercentage(), GAUGE, '%', {}, TYPE_DOUBLE)
    ]
}

function pizzaMetrics() {
    const metrics = [
        constructMetric(SOLD_PER_MINUTE, soldPizzas, GAUGE, '1', {}, TYPE_INT),
        constructMetric(CREATION_FAILURE, creationFailPizzas, GAUGE, '1', {}, TYPE_INT),
        constructMetric(REVENUTE_PER_MINUTE, revenuePizzas, GAUGE, '1', {}, TYPE_DOUBLE)
    ]
    console.log('sold pizzas:', soldPizzas)
    soldPizzas = 0
    creationFailPizzas = 0
    revenuePerMinMetric = 0
    return metrics
}

function sendMetricsPeriodically(period) {
    const timer = setInterval(() => {
        try {
            const metrics = [];
            metrics.push(...httpMetrics())
            metrics.push(...userMetrics())
            metrics.push(...authMetrics())
            metrics.push(...systemMetrics())
            metrics.push(...pizzaMetrics())
            metrics.push(...pizzaCreationLatencies)
            metrics.push(...endPointLatencies)
            pizzaCreationLatencies = []
            endPointLatencies = []
            const reqMetrics = { resourceMetrics: [{ scopeMetrics: [{ metrics }] }] }
            sendMetricsToGrafana(reqMetrics);
        } catch (error) {
            console.log('Error sending metrics', error);
        }
    }, period);
}

function sendMetricsToGrafana(metrics) {
    const body = JSON.stringify(metrics);
    console.log('body', body)
    fetch(`${config.metrics.url}`, {
        method: 'POST',
        body: body,
        headers: { Authorization: `Bearer ${config.metrics.apiKey}`, 'Content-Type': 'application/json' },
    })
        .then((response) => {
            if (!response.ok) {
                response.text().then((text) => {
                    console.error(`Failed to push metrics data to Grafana: ${text}\n${body}`);
                });
            } else {
                console.log(`Pushed metrics`);
            }
        })
        .catch((error) => {
            console.error('Error pushing metrics:', error);
        });
}

module.exports = {
    requestTracker,
    constructMetric,
    sendMetricsPeriodically,
    decrementActiveUsers,
    incrementActiveUsers,
    incrementAuthAttempts,
    incrementFailedAuthAttempts,
    addRevenue,
    incrementSoldPizzas,
    pizzaCreationLatencyTracking,
    incrementFailedPizzas,
    timeTracker
};

