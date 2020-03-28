"use strict";
var app;
(function (app) {
    function PrepareResources() {
        let R = ftk.Engine.R.Edit();
        let ImageR = ftk.ImageResource;
        let AudioR = ftk.AudioResource;
        R.Add(new ImageR("res/images/desktop.jpg"));
        R.Add(new ImageR("res/images/ready.png"));
        R.Add(new ImageR("res/images/ready-down.png"));
        R.Add(new ImageR("res/images/ready-hover.png"));
        R.Add(new AudioR("res/audios/bk.mp3"));
    }
    app.PrepareResources = PrepareResources;
})(app || (app = {}));
var app;
(function (app) {
    class BackgroundLayer extends ftk.BackgroundImageLayer {
        constructor() {
            super();
            let image = ftk.Engine.R.GetImage("res/images/desktop.jpg");
            if (image) {
                this.BackgroundImage = image;
            }
            this.RepeatStyle = "repeat";
            this.EventTransparent = false;
        }
    }
    class StartLayer extends ftk.Layer {
        constructor() {
            super();
            let R = ftk.Engine.R;
            let ready = new ftk.ui.ImageButton(R.GetImage("res/images/ready.png"), "Game.Start.Button");
            ready.DownResource = R.GetImage("res/images/ready-down.png");
            ready.HoverResource = R.GetImage("res/images/ready-hover.png");
            ready.Position = new ftk.Point(280, 200);
            this.AddNode(ready);
            let ani = new ftk.KeyframeAnimation(true, true);
            ani.AddFrame(new ftk.AngleAnimation(0, Math.PI * 2, 1000, true, true));
            ani.AddFrame(new ftk.OpacityAnimation(0, 1, 3000, true, true));
            ani.AddFrame(new ftk.BoxAnimation(new ftk.Rectangle(280, 200, 50, 50), new ftk.Rectangle(200, 150, 300, 100), 3000, true, true));
            ready.AddAnimation(ani);
        }
    }
    class EffectsLayer extends ftk.Layer {
        constructor(stage) {
            super();
            let fireworks = new ftk.particles.FireworkAnimation();
            fireworks.Position = new ftk.Point(0, 0);
            fireworks.Resize(stage.Width, stage.Height);
            this.AddNode(fireworks);
        }
    }
    class DemoGame {
        constructor() {
            this.mEffectsLayer = new EffectsLayer(ftk.Engine.Root);
            ftk.Engine.Root.AddLayer(new BackgroundLayer());
            ftk.Engine.Root.AddLayer(new StartLayer());
            ftk.Engine.Root.AddLayer(this.mEffectsLayer);
            ftk.Engine.addListener("mouseup", (ev) => {
                console.log(ev.Target);
                if (ev.Target) {
                    if (ev.Target.Id === "Game.Start.Button") {
                        this.mEffectsLayer.Visible = !this.mEffectsLayer.Visible;
                        if (this.mEffectsLayer.Visible) {
                        }
                        else {
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
