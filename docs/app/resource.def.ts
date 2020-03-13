namespace app {
    export function PrepareResources(): void {
        let R = ftk.Engine.R.Edit();
        let ImageR = ftk.ImageResource;
        let AudioR = ftk.AudioResource;
        let VideoR = ftk.VideoResource;

        R.Add(new ImageR("res/images/desktop.jpg"));
        R.Add(new ImageR("res/images/ready.png"));
        R.Add(new ImageR("res/images/ready-down.png"));
        R.Add(new ImageR("res/images/ready-hover.png"));
        R.Add(new ImageR("res/images/desktop.jpg"));

        R.Add(new AudioR("res/audios/bk.mp3"));
        
    }
}