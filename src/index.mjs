import https from 'https';

const logFunc = (func) => {
    return (...args) => {
        console.log(`${func.name} Start`)
        func(...args)
        console.log(`${func.name} End`)
    }
}

const callBackTest = logFunc( function callBackTest() {

    function processRes(res) {
        console.log(`Got response: ${res.statusCode}`);
        res.resume();
    }

    function processErr(e) {
        console.log(`Got error: ${e.message}`);
    }

    https.get('https://www.baidu.com', processRes).on('error', processErr);
})

const promiseTest = logFunc( function promiseTest() {

    const p = new Promise( (resolve, reject) => {
        https.get('https://www.baidu.com', resolve).on('error', reject);
    });

    p.then( res => {
        console.log(`Got response: ${res.statusCode}`);
        res.resume();
    }).catch ( e => {
        console.log(`Got error: ${e.message}`);
    })

});

const promiseTest2 = logFunc( function promiseTest2() {

    const ADD_1 = (x) => {
        return (x + 1);
    }

    const ADD_2 = (x) => {
        return (x + 2);
    }

    const p_ADD_1 = (x) => {
        return new Promise((resolve) => {
            resolve(ADD_1(x))
        });
    };

    const p_ADD_2 = (x) => {
        return new Promise((resolve) => {
            resolve(ADD_2(x))
        });
    };

    p_ADD_1(1)
    .then(x => p_ADD_2(x))
    .then(x => console.log(x));

    // p_ADD_1(1).then(
    //     x => p_ADD_2(x).then(
    //         x => console.log(x)
    //     )
    // );

    async function awaitTest() {
        const result_1 = await p_ADD_1(1);
        const result_2 = await p_ADD_2(result_1);
        console.log(`awaitTest: ${result_2}`);
        return result_2;
    }

    const result = awaitTest();
    console.log(`awaitTest return: ${result}`);

    async function awaitTest2() {
        const init = x => x;
        const result = await p_ADD_2(await p_ADD_1(await init(1)));
        console.log(`awaitTest2: ${result}`);
        return result;
    }

    awaitTest2();
});

const awaitRejectTest = logFunc( function awaitRejectTest() {
    async function awaitRejectTestInside() {
        const p_ADD_1 = (x) => {
            return new Promise((resolve, reject) => {
                if (x === 99) {
                    reject(new Error(`Rejected ${x}`))
                }
                resolve(x+1)
            });
        };
        try {
            const result = await p_ADD_1(99);
            console.log(result);
        } catch (e) {
            console.log(e);
        }
        try {
            const result = await p_ADD_1(await p_ADD_1(98));
            console.log(result);
        } catch (e) {
            console.log(e);
        }
        try {
            const result = await p_ADD_1(await p_ADD_1(99));
            console.log(result);
        } catch (e) {
            console.log(e);
        }
    }
    awaitRejectTestInside();
});

const main = () => {
    console.log('main func run.');
    callBackTest();
    promiseTest();
    promiseTest2();
    awaitRejectTest();
};

main(); 
