(async function () {
    const url = 'https://m.tg3.net/xijupian/50462/play-1-1.html';
    let browser = require('../index');
    browser = new browser('firefox', false, false);
    let networks = await browser.listenNetwork(url, 10000);
    console.info("页面加载的网络请求：", networks);
})();
