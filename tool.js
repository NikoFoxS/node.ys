const puppeteer = require('puppeteer-core');
const fs = require('fs-extra');
const mime = require('mime');

var webDownload = (chromePath,url, path, files = []) => {
    var b = fs.existsSync(path);
    if(b)
    {
        fs.emptyDirSync(path);
    }else
    {
        fs.mkdirSync(path);
    }
    puppeteer.launch(
        {
            executablePath: chromePath,
            headless: false,
            ignoreDefaultArgs: ['--enable-automation'],
            devtools: true
        }
    ).then(async (browser) => {
        const page = await browser.newPage();
        page.on('response', async response => {
            var url = response.url();
            url = url.split('?')[0];
            var download = false;
            if (files.length) {
                let i = files.length;
                while (i--) {
                    if (url.indexOf(files[i]) != -1) {
                        download = true;
                    }
                    break;
                }
            } else {
                download = true;
            }

            if (download) {
                var arr = url.split('/');
                var filename = arr[arr.length - 1];

                if (filename == '') {
                    filename = 'index.html'
                } else {
                    var arr = url.match(/[\.]\w*$/g);
                    if (!arr) {
                        filename = '';
                    }
                }

                if (filename != '') {
                    const buffer = await response.buffer();
                    fs.writeFileSync(path + '/' + filename, buffer);
                    console.log('下载', path + '/' + filename)
                }


            }
        })
        await page.goto(url);

    }).catch(() => { })
}

module.exports.webDownload = webDownload;