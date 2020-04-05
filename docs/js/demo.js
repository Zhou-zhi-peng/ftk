"use strict";
var app;
(function (app) {
    function PrepareResources() {
        let R = ftk.Engine.R.Edit();
        R.Add("res/images/spaceBG.jpg", "BG");
        R.Add("res/images/ready.png", "ready");
        R.Add("res/images/ready-down.png", "ready-down");
        R.Add("res/images/ready-hover.png", "ready-hover");
        R.Add("res/images/cloud0.png", "cloud0");
        R.Add("res/images/cloud1.png", "cloud1");
        for (let i = 1; i < 18; ++i) {
            R.Add("res/images/m" + i.toString() + ".png", "m" + i.toString());
        }
        R.Add("res/video/oceans.mp4", "oceans");
    }
    app.PrepareResources = PrepareResources;
})(app || (app = {}));
var app;
(function (app) {
    function createTexture(r, rid) {
        let img = r.GetImage(rid);
        if (img) {
            return ftk.createTexture(img);
        }
        return ftk.createTexture(r.GetVideo(rid));
    }
    class BackgroundLayer extends ftk.BackgroundImageLayer {
        constructor() {
            super();
            this.BackgroundTexture = createTexture(ftk.Engine.R, "BG");
            this.RepeatStyle = ftk.BackgroundImageRepeatStyle.repeat;
            this.EventTransparent = false;
        }
    }
    class StartLayer extends ftk.Layer {
        constructor() {
            super();
            let R = ftk.Engine.R;
            let ready = new ftk.ui.ImageButton(createTexture(ftk.Engine.R, "ready"), "Game.Start.Button");
            ready.DownTexture = createTexture(R, "ready-down");
            ready.HoverTexture = createTexture(R, "ready-hover");
            ready.Position = new ftk.Point(280, 520);
            this.Add(ready);
            let g = new ftk.GraphicsSprite(0, 0, 800, 600);
            g.beginFill(new ftk.Color(0, 0, 255));
            g.beginClipPath();
            g.circle(400, 300, 220);
            g.endClipPath();
            g.endFill();
            g.drawTexture(createTexture(ftk.Engine.R, 'oceans'), 0, 0, 800, 800);
            g.beginText("宋体", 16);
            g.text("DEMO 视频", 400, 300, 400, new ftk.Color(255, 255, 255, 1));
            g.endText();
            g.SetBasePointToCenter();
            g.AddAnimation(new ftk.AngleAnimation(0, ftk.PI_2_0X, 60000, true, true));
            g.Visible = false;
            this.Add(g);
            this.VSprite = g;
        }
    }
    class EffectsLayer extends ftk.Layer {
        constructor(stage) {
            super();
            let R = ftk.Engine.R;
            let b = new ftk.ImageSprite(ftk.createTexture(R.GetImage('cloud0')));
            b.Position = new ftk.Point(0, 0);
            this.Add(b);
            b.AddAnimation(new ftk.PosXAnimation(-1000, 1000, 15000, true, true));
            let c = new ftk.ImageSprite(ftk.createTexture(R.GetImage('cloud1')));
            c.Position = new ftk.Point(0, 0);
            this.Add(c);
            c.AddAnimation(new ftk.PosXAnimation(-1000, 1000, 30000, true, true));
            let a = new ftk.ImageSprite();
            let ac = new ftk.SequenceAnimation(100, undefined, true, true);
            for (let i = 1; i < 18; ++i) {
                ac.AddFrame(createTexture(R, 'm' + i.toString()));
            }
            a.AddAnimation(ac);
            a.Width = 650;
            a.Height = 435;
            a.X = 200 * Math.random();
            a.Y = 100 * Math.random();
            this.Add(a);
        }
    }
    class DemoGame {
        constructor() {
            this.mEffectsLayer = new EffectsLayer(ftk.Engine.Root);
            let s = new StartLayer();
            ftk.Engine.Root.AddLayer(new BackgroundLayer());
            ftk.Engine.Root.AddLayer(s);
            ftk.Engine.Root.AddLayer(this.mEffectsLayer);
            ftk.Engine.addListener("mouseup", (ev) => {
                console.log(ev.Target);
                if (ev.Target) {
                    if (ev.Target.Id === "Game.Start.Button") {
                        this.mEffectsLayer.Visible = !this.mEffectsLayer.Visible;
                        if (this.mEffectsLayer.Visible) {
                        }
                        else {
                            let v = ftk.Engine.R.GetVideo('oceans');
                            if (v) {
                                s.VSprite.Visible = true;
                                v.Video.play();
                            }
                        }
                    }
                }
            });
            ftk.Engine.addListener("fault", (ev) => {
                this.OnGameFault(ev.Args);
            });
        }
        StartUp() {
            console.log("game StartUp!");
        }
        OnGameFault(reason) {
        }
    }
    function Main(canvas) {
        ftk.LibrarySetup({
            canvas,
            HideLoading: false,
            HideLogo: false
        });
        app.PrepareResources();
        ftk.Engine.addListener("loading", (ev) => {
            let progress = ev.Args;
            console.log(progress);
        });
        ftk.Engine.addListener("ready", () => {
            console.log("program start.");
            let game = new DemoGame();
            game.StartUp();
        });
        ftk.Engine.addListener("fault", (ev) => {
            console.error("game fault:", ev);
        });
        ftk.Engine.Run();
    }
    app.Main = Main;
})(app || (app = {}));
