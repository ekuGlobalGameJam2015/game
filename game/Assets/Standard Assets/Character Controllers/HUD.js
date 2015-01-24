#pragma strict

static var barDisplay : float = .4;
static var pos : Vector2 = new Vector2(20,40);
static var size : Vector2 = new Vector2(60,20);
static var progressBarEmpty : Texture2D;
static var progressBarFull : Texture2D = new Texture2D(128, 18);

function Start () {
		 progressBarFull = new Texture2D(128, 18);
		 progressBarEmpty = new Texture2D(128, 18);
		// Fill the texture with Sierpinski's fractal pattern!
		for (var y : int = 0; y < progressBarEmpty.height; ++y) {
			for (var x : int = 0; x < progressBarEmpty.width; ++x) {
				var color = (x&y) ? Color.white : Color.gray;
				progressBarFull.SetPixel (x, y, Color.green);
				progressBarEmpty.SetPixel (x, y, Color.red);
			}
		}
		progressBarFull.Apply();
		progressBarEmpty.Apply();
		Debug.Log("DONE");

}

function Update () {

}

function OnGUI(){
	GUI.Label (Rect (10, 10, 100, 20), "Hello World!");
 // draw the background:
 GUI.BeginGroup (new Rect (pos.x, pos.y, size.x, size.y));
     GUI.Box (Rect (0,0, size.x, size.y),progressBarEmpty);
 
     // draw the filled-in part:
     GUI.BeginGroup (new Rect (0, 0, size.x * barDisplay, size.y));
         GUI.Box (Rect (0,0, size.x, size.y),progressBarFull);
     GUI.EndGroup ();
 
 GUI.EndGroup ();
}