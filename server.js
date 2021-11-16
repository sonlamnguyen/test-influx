const { InfluxDB, Point } = require('@influxdata/influxdb-client')

// You can generate an API token from the "API Tokens Tab" in the UI
const token = 'ZhjWwoESb6juvA_E3u1ceHJh0dykZSActpz2cmQNtcRqgCl2psHJ30ml6fv1lMaHr8xC9V9jvlaTS5FkvncxDQ=='
const org = 'lumi-demo'
const bucket = 'smarthome-test'

const client = new InfluxDB({ url: 'http://localhost:8086', token: token })


const writeApi = client.getWriteApi(org, bucket)

function insertData(index) {
    const obj = {
        hello: "abc",
        number: index
    };
    writeApi.useDefaultTags({
        user_id: (index / 10) + 1,
        home_id: index,
        device_id: "device_" + index,
        name: "name" + Math.round(index%10),
        tag: JSON.stringify(obj)
    });

    const point = new Point('mem').floatField('used_percent', 23.43234543);
    writeApi.writePoint(point);
}

const pow = 5;


console.log(process.argv);
const date = new Date();
const number = date.getHours() + date.getMinutes();
console.log({ number });

function runInsert() {
    for (let index = 0; index < Math.pow(10, pow); index++) {
        insertData(number * Math.pow(10, pow) + index);
    }
    writeApi.close()
        .then(() => {
            console.log('FINISHED')
        })
        .catch(e => {
            console.error(e)
            console.log('Finished ERROR')
        });
}

// runInsert();

const queryApi = client.getQueryApi(org)
const host = "host2";
const query = `from(bucket: "smarthome-test") 
                    |> range(start: -10h) 
                    |> group()
                    |> count(column:"name")`;
console.log({query});

queryApi.queryRows(query, {
    next(row, tableMeta) {
        const o = tableMeta.toObject(row)
        console.log(o);
        console.log(`${o._time} ${o._measurement}: ${o._field}=${o._value}`)
    },
    error(error) {
        console.error(error)
        console.log('Finished ERROR')
    },
    complete() {
        console.log('Finished SUCCESS')
    },
});


