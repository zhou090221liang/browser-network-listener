(async function () {
    //查询出这个网页里的视频资源
    const url = 'https://www.iqiyi.com/w_19rv6y3em5.html';
    let browser = require('../index');
    browser = new browser('firefox');
    let networks = await browser.listenNetwork(url, 10000);
    let video = networks.filter(item => item.response && item.response.json && item.response.json.msg == "200" && item.response.json.ext && item.response.json.url);
    if (video && video.length) {
        for (let i = 0; i < video.length; i++) {
            console.info("爬取到视频播放地址：", video[i].response.json);
        }
    } else {
        console.warn("该地址没有爬取到视频播放地址");
    }
})();
