#pragma strict
import System.Collections.Generic;
import System.Linq;


public class Room {
	public var connections : Array = new Array();
	public var pos : Vector3;
	
	public function Room(location : Vector3){
		pos = location;
	};
};

public class Hallway {
	public var connections : Hashtable = new Hashtable();
	
	public var room1 : Room;
	public var room2 : Room;
	
	public var length : int;
	
	public var pos : Vector3;
	
	public function Hallway(hallwayPos : Vector3, hallwayLength : int, roomFrom : Room, roomTo : Room){
		pos = hallwayPos;
		length = hallwayLength;
		room1 = roomFrom;
		room2 = roomTo;
	};
	
	public function orientation() : int{
		if( room1.pos.z != room2.pos.z)
			return World.NORTH;
		if( room1.pos.x != room2.pos.x)
			return World.EAST;
		if( room1.pos.y != room2.pos.y)
			return World.UP;
		return -1;
	}
};

public class World extends UnityEngine.Object {
	// The numbers are so that you can get the 
	// reverse direction by doing a rev = (dir + 3) % 6
	public static var NORTH : int = 0;
	public static var SOUTH : int  = 3;
	public static var WEST : int  = 1;
	public static var EAST : int  = 4;
	public static var UP : int  = 2;
	public static var DOWN : int  = 5;
	
	public var objects : Hashtable = new Hashtable();
	
	private function rev(dir : int) : int {
		return (dir + 3) % 6;
	};


	public function World(){
		generate();
		draw();
	};

	public function generate() {
		var queue : Queue.<Room> = new Queue.<Room>();
		var firstRoom : Room = new Room(new Vector3(0,0,0));
		
		objects[firstRoom.pos] = firstRoom;
		queue.Enqueue(firstRoom);
		
		var numRooms = 1; //first room is a room
		while(numRooms < 10 && queue.Count > 0){
			var room : Room = queue.Dequeue();
			var available_directions : Array = available_dirs(room.pos);
			RandomizeArray(available_directions);
			for(var dir : int in available_directions){
				if(numRooms < 10 && Random.Range(0, 4) == 0){ //don't traverse every wall
					var nextRoom : Room = make_move(dir, room);
					queue.Enqueue(nextRoom);
					numRooms++;
				}
				
			}
			if(available_dirs(room.pos).length > 0){ //add it back if it can be revisited
				queue.Enqueue(room);
			}
		}
		Debug.Log(objects.Values.Count);
	};

	// add hallway and next room
	// return next room
	public function make_move(move : int, room : Room) : Room {
		
		var nextRoomLoc;
		var hallwayLoc;
		var loc : Vector3 = room.pos;
		
		switch (move){
			case NORTH:
				hallwayLoc = new Vector3(loc.x, loc.y, loc.z + 1);
				nextRoomLoc = new Vector3(loc.x, loc.y, loc.z + 2);
				break;
			case SOUTH:
				hallwayLoc = new Vector3(loc.x, loc.y, loc.z - 1);
				nextRoomLoc = new Vector3(loc.x, loc.y, loc.z - 2);
				break;
			case EAST:
				hallwayLoc = new Vector3(loc.x + 1, loc.y, loc.z);
				nextRoomLoc = new Vector3(loc.x + 2, loc.y, loc.z);
				break;
			case WEST:
				hallwayLoc = new Vector3(loc.x - 1, loc.y, loc.z);
				nextRoomLoc = new Vector3(loc.x - 2, loc.y, loc.z);
				break;
			case UP:
				hallwayLoc = new Vector3(loc.x, loc.y + 1, loc.z);
				nextRoomLoc = new Vector3(loc.x, loc.y + 2, loc.z);
				break;
			case DOWN:
				hallwayLoc = new Vector3(loc.x, loc.y - 1, loc.z);
				nextRoomLoc = new Vector3(loc.x, loc.y - 2, loc.z);
				break;
		}
		var nextRoom : Room;
		if(nextRoomLoc in objects.Keys)
			nextRoom = objects[nextRoomLoc];
		else
			nextRoom = new Room(nextRoomLoc);
		var hallway : Hallway = new Hallway(hallwayLoc, 1, room, nextRoom);  // default to length == 1 for now
		
		objects[nextRoomLoc] = nextRoom;
		objects[hallwayLoc] = hallway;
		return nextRoom;
	};

	public function available_dirs(loc : Vector3) : Array {
		var dirs : Array = new Array();
		for(var dir : int = 0; dir < 6; dir++){
			if(is_available(dir, loc)){
				dirs.Push(dir);
			}
		}
		return dirs;
	};
	
	public function is_available(move: int, loc : Vector3) : boolean {
		
		switch (move){
			case NORTH:
				return !(
					new Vector3(loc.x, loc.y, loc.z + 1) in objects
				);
				break;
			case SOUTH:
				return !(
					new Vector3(loc.x, loc.y, loc.z - 1) in objects
				);
				break;
			case EAST:
				return !(
					new Vector3(loc.x + 1, loc.y, loc.z) in objects
				);
				break;
			case WEST:
				return !(
					new Vector3(loc.x - 1, loc.y, loc.z) in objects
				);
				break;
			/*case UP:
				return !(
					new Vector3(loc.x, loc.y + 1, loc.z) in objects
				);
				break;
			case DOWN:
				return !(
					new Vector3(loc.x, loc.y - 1, loc.z) in objects
				);
				break;*/
		}
		return false;
	};
	
	public function draw(){//room_s : GameObject, room_nsew : GameObject, room_nse : GameObject, room_se : GameObject){
		var meshes : Array = new Array();
		var cube : GameObject  = GameObject.CreatePrimitive(PrimitiveType.Cube);
		var cubeMesh : Mesh = cube.GetComponent(MeshFilter).mesh;
		var combine = new Array();
		
		var ci : CombineInstance;
		Debug.Log(objects.Values.Count);
		var scale : float = 50.0;
		for(var obj in objects.Values){
				if(typeof(obj) == Room){
					var room : Room = obj;
					ci = new CombineInstance();
					var room_dirs : Array = available_dirs(room.pos);
					var go : GameObject;
					if(
						!(NORTH in room_dirs) &&
						(SOUTH in room_dirs) &&
						(EAST in room_dirs) &&
						(WEST in room_dirs)// &&
						//(UP in room_dirs) &&
						//(DOWN in room_dirs)
					){
						go = Instantiate(
							world.room_s,
							room.pos*10,
							Quaternion.Euler(0,0,0)
						);
						go.transform.localScale = Vector3(1,1,1)*scale;
					}else if(
						(NORTH in room_dirs) &&
						!(SOUTH in room_dirs) &&
						(EAST in room_dirs) &&
						(WEST in room_dirs)// &&
						//(UP in room_dirs) &&
						//(DOWN in room_dirs)
					){
						go = Instantiate(
							world.room_s,
							room.pos*10,
							Quaternion.Euler(0,180,0)
						);
						go.transform.localScale = Vector3(1,1,1)*scale;
					}else if(
						(NORTH in room_dirs) &&
						(SOUTH in room_dirs) &&
						!(EAST in room_dirs) &&
						(WEST in room_dirs)// &&
						//(UP in room_dirs) &&
						//(DOWN in room_dirs)
					){
						go = Instantiate(
							world.room_s,
							room.pos*10,
							Quaternion.Euler(0,90,0)
						);
						go.transform.localScale = Vector3(1,1,1)*scale;
					}else if(
						(NORTH in room_dirs) &&
						(SOUTH in room_dirs) &&
						(EAST in room_dirs) &&
						!(WEST in room_dirs)// &&
						//(UP in room_dirs) &&
						//(DOWN in room_dirs)
					){
						go = Instantiate(
							world.room_s,
							room.pos*10,
							Quaternion.Euler(0,270,0)
						);
						go.transform.localScale = Vector3(1,1,1)*scale;
					}else if(
						(NORTH in room_dirs) &&
						!(SOUTH in room_dirs) &&
						!(EAST in room_dirs) &&
						(WEST in room_dirs)// &&
						//(UP in room_dirs) &&
						//(DOWN in room_dirs)
					){
						go = Instantiate(
							world.room_se,
							room.pos*10,
							Quaternion.Euler(0,180,0)
						);
						go.transform.localScale = Vector3(1,1,1)*scale;
					}else if(
						(NORTH in room_dirs) &&
						!(SOUTH in room_dirs) &&
						(EAST in room_dirs) &&
						!(WEST in room_dirs)// &&
						//(UP in room_dirs) &&
						//(DOWN in room_dirs)
					){
						go = Instantiate(
							world.room_se,
							room.pos*10,
							Quaternion.Euler(0,270,0)
						);
						go.transform.localScale = Vector3(1,1,1)*scale;
					}else if(
						!(NORTH in room_dirs) &&
						(SOUTH in room_dirs) &&
						!(EAST in room_dirs) &&
						(WEST in room_dirs)// &&
						//(UP in room_dirs) &&
						//(DOWN in room_dirs)
					){
						go = Instantiate(
							world.room_se,
							room.pos*10,
							Quaternion.Euler(0,90,0)
						);
						go.transform.localScale = Vector3(1,1,1)*scale;
					}else if(
						!(NORTH in room_dirs) &&
						(SOUTH in room_dirs) &&
						(EAST in room_dirs) &&
						!(WEST in room_dirs)// &&
						//(UP in room_dirs) &&
						//(DOWN in room_dirs)
					){
						go = Instantiate(
							world.room_se,
							room.pos*10,
							Quaternion.Euler(0,0,0)
						);
						go.transform.localScale = Vector3(1,1,1)*scale;
					}else if(
						!(NORTH in room_dirs) &&
						!(SOUTH in room_dirs) &&
						(EAST in room_dirs) &&
						!(WEST in room_dirs)// &&
						//(UP in room_dirs) &&
						//(DOWN in room_dirs)
					){
						go = Instantiate(
							world.room_nse,
							room.pos*10,
							Quaternion.Euler(0,0,0)
						);
						go.transform.localScale = Vector3(1,1,1)*scale;
					}else if(
						(NORTH in room_dirs) &&
						!(SOUTH in room_dirs) &&
						!(EAST in room_dirs) &&
						!(WEST in room_dirs)// &&
						//(UP in room_dirs) &&
						//(DOWN in room_dirs)
					){
						go = Instantiate(
							world.room_nse,
							room.pos*10,
							Quaternion.Euler(0,270,0)
						);
						go.transform.localScale = Vector3(1,1,1)*scale;
					}else if(
						!(NORTH in room_dirs) &&
						!(SOUTH in room_dirs) &&
						!(EAST in room_dirs) &&
						(WEST in room_dirs)// &&
						//(UP in room_dirs) &&
						//(DOWN in room_dirs)
					){
						go = Instantiate(
							world.room_nse,
							room.pos*10,
							Quaternion.Euler(0,180,0)
						);
						go.transform.localScale = Vector3(1,1,1)*scale;
					}else if(
						!(NORTH in room_dirs) &&
						(SOUTH in room_dirs) &&
						!(EAST in room_dirs) &&
						!(WEST in room_dirs)// &&
						//(UP in room_dirs) &&
						//(DOWN in room_dirs)
					){
						go = Instantiate(
							world.room_nse,
							room.pos*10,
							Quaternion.Euler(0,90,0)
						);
						go.transform.localScale = Vector3(1,1,1)*scale;
					}else if(
						!(NORTH in room_dirs) &&
						!(SOUTH in room_dirs) &&
						!(EAST in room_dirs) &&
						!(WEST in room_dirs)// &&
						//(UP in room_dirs) &&
						//(DOWN in room_dirs)
					){
						go = Instantiate(
							world.room_nsew,
							room.pos*10,
							Quaternion.Euler(0,0,0)
						);
						go.transform.localScale = Vector3(1,1,1)*scale;
					}else{
						ci.mesh = Instantiate(cubeMesh);
						ci.transform = Matrix4x4.TRS(
							room.pos*10,
							Quaternion.Euler(0,0,0),
							Vector3(1,1,1)*10
						);
						Debug.Log("Could not find prefab" + room.pos + room_dirs + 
						(NORTH in room_dirs) + (SOUTH in room_dirs) + (EAST in room_dirs) + (WEST in room_dirs));
					}
					combine.Push(ci);
					
					
					var light : GameObject = new GameObject("Light");
					light.AddComponent(Light);
					light.transform.position = room.pos*10;
				
				}else if(typeof(obj) == Hallway){
					var hallway : Hallway = obj;
					ci = new CombineInstance();
					ci.mesh = Instantiate(cubeMesh);
					switch(hallway.orientation()){
						case NORTH:
							ci.transform = Matrix4x4.TRS(
								hallway.pos*10,
								Quaternion.Euler(0,0,0),
								Vector3(2,2,5)*2
							);
							break;
						case EAST:
							ci.transform = Matrix4x4.TRS(
								hallway.pos*10,
								Quaternion.Euler(0,90,0),
								Vector3(2,2,5)*2
							);
							break;
						case UP:
							ci.transform = Matrix4x4.TRS(
								hallway.pos*10,
								Quaternion.Euler(0,0,90),
								Vector3(2,2,5)*2
							);
							break;
						default:
							break;
					}
					combine.Push(ci);
				}
		}
		var mesh : Mesh = new Mesh();
		mesh.CombineMeshes(combine.ToBuiltin(CombineInstance) as CombineInstance[]);
		mesh.RecalculateNormals();
		mesh.triangles = mesh.triangles.Reverse().ToArray(); //remove when have normal objects
		

		var world = new GameObject("WorldGenerated", MeshFilter, MeshRenderer);
		var mf : MeshFilter = world.GetComponent(MeshFilter);
		world.GetComponent(MeshRenderer).material.shader = Shader.Find("Diffuse");
		mf.mesh = mesh;
		world.AddComponent("MeshCollider");
		
		Destroy(cube);
		
	};
	
	//http://answers.unity3d.com/questions/16531/randomizing-arrays.html
	static function RandomizeArray(arr : Array)
	{
	    for (var i = arr.length - 1; i > 0; i--) {
	        var r = Random.Range(0,i);
	        var tmp = arr[i];
	        arr[i] = arr[r];
	        arr[r] = tmp;
	    }
	};
};

public var world : World;
public static var room_s : GameObject;
public static var room_nsew : GameObject;
public static var room_nse : GameObject;
public static var room_se : GameObject;

function Start () { 
	room_s = Resources.Load("Room_S");
	room_nsew = Resources.Load("Room_NSEW");
	room_nse= Resources.Load("Room_NSE");
	room_se = Resources.Load("Room_SE");
	world = new World();
}

function Update () {

}
