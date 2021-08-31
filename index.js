const playwright = require('playwright');

const _browser = class {
    /**
     * 初始化浏览器对象（注意：某些网站只能在特定的浏览器下才能访问到数据）
     * @param {String} driver chromium | firefox | webkit
     * @param {Boolean} headless 是否无头模式
     * @param {Boolean} mobile 是否模拟移动端(iPhone11)浏览器
     */
    constructor(driver = 'chromium', mobile = true, headless = true) {
        //保存配置文件
        this._config = {
            driver,
            mobile,
            headless
        };
        //是否手机模式(火狐不支持)
        if (this._config.mobile && driver != 'firefox') {
            this._config.iPhone11 = playwright.devices['iPhone 11 Pro'];
            this._config.contentConfig = {
                ...obj._config.iPhone11,
                locale: 'en-US',
                geolocation: { longitude: 12.492507, latitude: 41.889938 },
                permissions: ['geolocation']
            }
        } else {
            this._config.contentConfig = {
                locale: 'en-US',
                geolocation: { longitude: 12.492507, latitude: 41.889938 },
                permissions: ['geolocation']
            }
        }
        //获取对应的浏览器设备
        this._instance = {};
        switch (driver) {
            case "firefox":
                this._instance.driver = playwright["firefox"];
                break;
            case "webkit":
                this._instance.driver = playwright["webkit"];
                break;
            default:
                this._instance.driver = playwright["chromium"];
                break;
        }
        this.listenNetwork = _listenNetwork;
    }
};

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

/**
 * 监听页面所有的资源加载项
 * @param {*} url 需要加载的网页地址
 * @param {number} [networkidletimeout=3000] 超时时间
 * @returns
 */
async function _listenNetwork(url, networkidletimeout = 30000) {
    const network = [];
    const browser = await this._instance.driver.launch({ headless: this._config.headless });
    const context = await browser.newContext(this._config.contentConfig);
    const page = await context.newPage();
    await page.route('**', async (route) => {
        await route.continue();
        const request = await route.request();
        const _network = {
            request: {
                //如requestfailed事件所报告的，除非此请求失败，否则该方法返回null。
                failure: request.failure(),
                url: request.url(),
                method: request.method(),
                headers: request.headers(),
                postData: request.postData(),
                postDataBuffer: request.postDataBuffer(),
                resourceType: request.resourceType(),
                timing: request.timing(),
            }
        };
        const response = await request.response();
        _network.response = null;
        if (response) {
            try {
                const body = await response.body();
                //等待此响应完成，如果请求失败，则返回失败错误。
                const finished = await response.finished();
                const headers = response.headers();
                const ok = response.ok();
                const serverAddr = await response.serverAddr();
                const status = response.status();
                const statusText = response.statusText();
                const text = await response.text();
                let json = null;
                try {
                    json = await response.json();
                } catch (e) { }
                _network.response = {
                    body,
                    finished,
                    headers,
                    ok,
                    serverAddr,
                    status,
                    statusText,
                    text,
                    json
                };
            } catch (e) {
                _network.responseError = new Error(e);
            }
        }
        network.push(_network);
    });
    await page.goto(url);
    try {
        await page.waitForLoadState('networkidle', {
            timeout: networkidletimeout
        });
    } catch (e) { }
    await browser.close();
    return network;
}

module.exports = _browser;