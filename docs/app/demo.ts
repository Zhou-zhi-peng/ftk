/// <reference path="../../src/engine.ts" />
/// <reference path="../../src/stage.ts" />
/// <reference path="../../src/sprite.ts" />
/// <reference path="../../src/imagesprite.ts" />
/// <reference path="../../src/layer.ts" />
/// <reference path="../../src/videosprite.ts" />
/// <reference path="../../src/ui/button.ts" />
/// <reference path="../../src/ui/progressbar.ts" />
/// <reference path="../../src/net.ts" />


namespace app {
    class BackgroundLayer extends ftk.BackgroundImageLayer {
        constructor(stage: ftk.Stage) {
            super();
            let image = ftk.Engine.R.GetImage("res/images/desktop.jpg");
            if(image)
                this.BackgroundImage = image;
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
            ready.Position = { x: 280, y: 510 };
            this.AddNode(ready);

            /*let p:ftk.ui.ProgressBar = new ftk.ui.CircularProgressBar(200, 200, 100, 100);
            p.Value = 35;
            this.AddNode(p);

            p = new ftk.ui.RectangularProgressBar(100, 330, 500, 20);
            p.Value = 35;
            this.AddNode(p);*/
        }
    }

    class EffectsLayer extends ftk.Layer {
        constructor(stage: ftk.Stage) {
            super();
            let R = ftk.Engine.R;
            let fireworks = new ftk.particles.FireworkAnimation();
            fireworks.Position = { x: 0, y: 0 };
            fireworks.Resize(stage.Width,stage.Height);
            this.AddNode(fireworks);
        }
    }


    class DemoGame {
        private mEffectsLayer: EffectsLayer;
        constructor() {
            this.mEffectsLayer = new EffectsLayer(ftk.Engine.Root);
            ftk.Engine.Root.AddLayer(new BackgroundLayer(ftk.Engine.Root));
            ftk.Engine.Root.AddLayer(new StartLayer());
            ftk.Engine.Root.AddLayer(this.mEffectsLayer);
            
            ftk.Engine.addMouseListener("mouseup" ,(ev) => {
                console.log(ev.Target);
                if (ev.Target) {
                    if (ev.Target.Id === "Game.Start.Button") {
                        this.mEffectsLayer.Visible = !this.mEffectsLayer.Visible;
                        let a = ftk.Engine.R.GetAudio("res/audios/bk.mp3");
                        if(this.mEffectsLayer.Visible){
                            //video.Play();

                            //if(a)a.Audio.play();
                        }else{
                            //if(a)a.Audio.pause();
                        }
                    }
                }
            });

            ftk.Engine.addEngineListener("fault" ,(ev) => {
                this.OnGameFault(ev.Args);
            });
        }
        private OnGameFault(reason:string):void{
            console.error("game fault:",reason);
        }
        public StartUp():void{
            console.log("game StartUp!");
        }
    }

    export function Main(canvas:HTMLCanvasElement){
        ftk.LibrarySetup({
            canvas:canvas,
            HideLoading:false,
            HideLogo:false
        });

        PrepareResources();
        ftk.Engine.addEngineListener("loading",(ev)=>{
            let progress = ev.Args as number;
            console.log(progress);
        });
        ftk.Engine.addEngineListener("ready",(ev)=>{
            console.log("program start.");
            let game = new DemoGame();
            game.StartUp();
        });
        ftk.Engine.Run();
    }
}