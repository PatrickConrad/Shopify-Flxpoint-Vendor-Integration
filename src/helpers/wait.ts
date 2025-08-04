export function wait(time: number) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}


export function shortWait(minWait: number) {
    return new Promise(resolve => {
        const time = Math.floor(Math.random() * 1201);
        // console.log('TIMEOUT: ', time+minWait)
        setTimeout(resolve, time+minWait);
    });
}