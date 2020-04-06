(function () {
    let ftkinit = (function () {
        ftk.LibrarySetup({
            canvas: document.getElementById('test-canvas'),
            HideLoading: false,
            HideLogo: false
        });
        return true;
    })();

    let ftkrun = (function () {
        ftk.Engine.Run();
        return true;
    })();

    QUnit.test("Initialize", function (assert) {
        assert.ok(ftkinit, "FTK LibrarySetup");
        assert.ok(ftkrun, "FTK Engine Running");
    });

    QUnit.test("Engine Running", function (assert) {
        let R = ftk.Engine.R.Edit();
        assert.timeout(10000);
        let done = assert.async();
        let createTexture = function (r, rid) {
            let img = r.GetImage(rid);
            if (img) {
                return ftk.createTexture(img);
            }
            return ftk.createTexture(r.GetVideo(rid));
        }

        ftk.Engine.on("loading", function () {
            assert.step('loading');
        });

        ftk.Engine.on("ready", function () {
            assert.step('ready');
            assert.verifySteps(['loading', 'loading', 'loading', 'loading', 'ready']);

            let bkil = new ftk.BackgroundImageLayer();
            assert.ok(bkil, "create ftk.BackgroundImageLayer");
            bkil.BackgroundTexture = createTexture(ftk.Engine.R, "BG");
            assert.ok(bkil.BackgroundTexture, "createTexture BG");
            bkil.RepeatStyle = ftk.BackgroundImageRepeatStyle.repeat;
            assert.ok(bkil.RepeatStyle === ftk.BackgroundImageRepeatStyle.repeat, "set RepeatStyle");
            ftk.Engine.Root.AddLayer(bkil);
            assert.ok(ftk.Engine.Root.GetLayer(bkil.Id), "GetLayer");

            let g = new ftk.GraphicsSprite(0, 0, 800, 600);
            assert.ok(g, "create GraphicsSprite");
            g.beginFill(new ftk.Color(0, 0, 255));
            g.beginClipPath();
            g.circle(400, 300, 220);
            g.endClipPath();
            g.endFill();
            g.drawTexture(createTexture(ftk.Engine.R, 'oceans'), 0, 0, 800, 800);
            g.beginText("宋体", 16);
            g.text("请在5秒内点击此处", 400, 300, 400, new ftk.Color(255, 255, 255, 1));
            g.endText();
            g.SetBasePointToCenter();
            g.AddAnimation(new ftk.AngleAnimation(0, ftk.PI_2_0X, 60000, true, true));
            g.Visible = true;
            bkil.Add(g);
            assert.ok(bkil.Get(g.Id), "Layer.Get");

            let video = ftk.Engine.R.GetVideo('oceans');
            assert.ok(video, "ftk.Engine.R.GetVideo");
            assert.ok(video.Video, "VideoResource.Video");

            ftk.Engine.on("mouseup", function (ev) {
                assert.ok(ev.Target, "ftk.Engine.on.mousedown");
                if (ev.Target.Id === g.Id) {
                    video.Video.play();
                    assert.ok(true, "VideoResource.Video.play");
                }
                done();
            });
        });

        ftk.Engine.on("fault", function (message) {
            assert.ok(false, 'Engine fault:' + message);
        });

        assert.ok(R, "Loader Created");
        assert.ok((function () { ftk.registerResourceType('.map', ftk.ResourceType.Text); return true; })(), "registerResourceType Test");

        assert.ok(R.Add("../docs/res/images/spaceBG.jpg", "BG"), "Load Image Test");
        assert.ok(R.GetImage("BG"), "Loader.GetImage");

        assert.ok(R.Add("../docs/res/video/oceans.mp4", "oceans"), "Load video Test");
        assert.ok(R.GetVideo("oceans"), "Loader.GetVideo");

        assert.ok(R.Add("/output/ftk.js.map", "js.map"), "Load text Test");
        assert.ok(R.Has("js.map"), "Loader.Has");
    });

    QUnit.test("utility Tests", function (assert) {
        let u = ftk.utility;
        assert.ok(u, "ftk.utility");
        assert.ok(u.GenerateIDString(20).length === 20, "ftk.utility.GenerateIDString");

        let utf8 = 'abcdefg数据，ljalkfj,lsfj';
        let utf8buf = u.UTF8BufferEncode(utf8);
        assert.ok(utf8buf, "ftk.utility.UTF8BufferEncode");
        let utf8str = u.UTF8BufferDecode(utf8buf);
        assert.ok(utf8str === utf8, "ftk.utility.UTF8BufferDecode");
        assert.ok(utf8buf.byteLength === u.UTF8BufferEncodeLength(utf8), "ftk.utility.UTF8BufferEncodeLength");

        let hexstr = u.BufferToHexString(utf8buf);
        assert.ok(hexstr, "ftk.utility.BufferToHexString");
        assert.deepEqual(u.HexStringToBuffer(hexstr), utf8buf, "ftk.utility.HexStringToBuffer");

        let base64str = u.BufferToBase64(utf8buf);
        assert.ok(hexstr, "ftk.utility.BufferToBase64");
        assert.deepEqual(u.Base64ToBuffer(base64str), utf8buf, "ftk.utility.Base64ToBuffer");

        let urlData = { a: 10, b: 20, c: 'abc', d: '测试', e: null };
        let urlparams = u.ToURLParameters(urlData).split('&');

        assert.ok((function () {
            for (let s of urlparams) {
                if (s === 'a=10') {
                    continue;
                }

                if (s === 'b=20') {
                    continue;
                }

                if (s === 'c=abc') {
                    continue;
                }
                if (s === 'd=%E6%B5%8B%E8%AF%95') {
                    continue;
                }
                if (s === 'e=null') {
                    continue;
                }
                return false;
            }
            return true;
        })(), "ftk.utility.ToURLParameters");

        assert.ok(u.PrefixPad('1234', 8, '0') === '00001234', "ftk.utility.PrefixPad");

        let date = new Date(2019, 3, 6, 18, 15, 5, 33);
        assert.ok(u.DateFormat('YYYY-mm-dd HH:MM:SS.XXX', date) === '2019-04-06 18:15:05.033', "ftk.utility.DateFormat");
        assert.ok(u.DateFormat('YY/mm/dd HH:MM:SS', date) === '19/04/06 18:15:05', "ftk.utility.DateFormat");

        let Path = u.Path;
        let path = 'https://developer.mozilla.org/test/./zh-CN/../search?q=Indexed%20DB#IndexedDB';
        assert.ok(Path.sep === '/', 'ftk.utility.Path.sep');
        assert.ok(Path.join(path, 'index.html') === 'https://developer.mozilla.org/test/search/index.html?q=Indexed%20DB#IndexedDB', 'ftk.utility.Path.join');
        assert.ok(Path.urlpath(path) === '/test/./zh-CN/../search', 'ftk.utility.Path.urlpath');
        assert.ok(Path.isurl(path), 'ftk.utility.Path.isurl');
        assert.ok(Path.relative(path, "https://developer.mozilla.org/test/zh-CN/"), 'ftk.utility.Path.relative');

        path = 'https://developer.mozilla.org/test/./zh-CN/../search.php?q=Indexed%20DB#IndexedDB';
        assert.ok(Path.extname(path) === '.php', 'ftk.utility.Path.extname');
        assert.ok(Path.basename(path) === 'search', 'ftk.utility.Path.basename');
        assert.ok(Path.lastpart(path) === 'search.php', 'ftk.utility.Path.lastpart');
        assert.ok(Path.dirname(path) === 'test/./zh-CN/../', 'ftk.utility.Path.dirname');
        assert.ok(Path.chextension(path, '.html') === 'https://developer.mozilla.org/test/./zh-CN/../search.html?q=Indexed%20DB#IndexedDB', 'ftk.utility.Path.chextension');
        assert.ok(Path.chbasename(path, 'demo') === 'https://developer.mozilla.org/test/./zh-CN/../demo.php?q=Indexed%20DB#IndexedDB', 'ftk.utility.Path.chbasename');
        assert.ok(Path.chlastpart(path, 'demo.html') === 'https://developer.mozilla.org/test/./zh-CN/../demo.html?q=Indexed%20DB#IndexedDB', 'ftk.utility.Path.chlastpart');
        assert.ok(Path.isabsolute(path), 'ftk.utility.Path.isabsolute');

        assert.ok(ftk.utility.api.createOffscreenCanvas(300, 500), 'ftk.utility.api.createOffscreenCanvas');
    });
})();

