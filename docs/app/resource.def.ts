namespace app {
    export function PrepareResources(): void {
        let R = ftk.Engine.R.Edit();

        R.Add("res/images/spaceBG.jpg", "BG");
        R.Add("res/images/ready.png", "ready");
        R.Add("res/images/ready-down.png", "ready-down");
        R.Add("res/images/ready-hover.png", "ready-hover");

        R.Add("res/images/cloud0.png", "cloud0");
        R.Add("res/images/cloud1.png", "cloud1");

        for (let i = 1; i < 18; ++i) {
            R.Add("/res/images/" + i.toString() + ".png", "m" + i.toString());
        }

        R.Add("res/video/oceans.mp4", "oceans");
    }
}
