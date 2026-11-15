//Arc threadsafe reference-counting pointer
use std::{collections::HashMap, convert::Infallible, sync::Arc,env};
use tokio::sync::{mpsc, RwLock};
use warp:: {ws::Message, Filter, Rejection};
use config::{Config,File};
use std::net::SocketAddr;
use ws::KeyNoteRequest;
mod handlers;
mod ws;

const WEB_FOLDER: &str = "web-folder/";
const NODE_MOD_FOLDER: &str = "node_modules/";

//client struct
#[derive(Debug,Clone)]
pub struct Client{
    //rand uuid
    pub username: String,
    pub room:String,
    pub note:Option<KeyNoteRequest>,
    //Allows us to send messages to UnboundedReceiver (client)
    pub sender: Option<mpsc::UnboundedSender<std::result::Result<Message, warp::Error>>>,
}

//keep track of clients.
type Clients = Arc<RwLock<HashMap<String, Client>>>;

//type alias for Result (takes any type) (either type or rejection)
type Result<T> = std::result:: Result<T,Rejection>;

//macro from tokio runtime
#[tokio::main]
//on the eventloop
async fn main(){
    let environment = env::var("ENV").unwrap_or_else(|_| "dev".into());
    
    let configs = Config::builder()
        .add_source(File::with_name(&format!("configs/{environment}.toml")))
        .build().unwrap();

    // Print out our settings (as a HashMap)
    println!(
        "{:?}",
        configs.clone()
            .try_deserialize::<HashMap<String, String>>()
            .unwrap()
    );

    //Creates a threadsafe hashmap of clients
    let clients: Clients = Arc::new(RwLock::new(HashMap::new()));

    let html_content = warp::fs::dir(WEB_FOLDER);

    let index = warp::get().and(warp::path::end())
        .and(warp::fs::file(format!("{}/templates/_layouts/index.html",WEB_FOLDER)));

    let js =  warp::get().and(warp::path!("static"))
        .and(warp::fs::dir(format!("{}/static/js/",WEB_FOLDER)));

    let node_modules = warp::get().and(warp::path!("node_modules"))
        .and(warp::fs::dir(format!("{}/node_modules/",NODE_MOD_FOLDER)));


    let static_site = index.or(js).or(html_content).or(node_modules);

    // GET Health Check route
    let health_route = warp::path!("health")
        .and_then(handlers::health_handler);

    let register = warp::path("register");

    //register route (only posts and deletes, takes jsons)
    let register_route = register
        .and(warp::post())
        .and(warp::body::json())
        .and(with_clients(clients.clone()))
        .and_then(handlers::register_handler)
        .or(register
            .and(warp::delete())
            .and(warp::path::param())
            .and(with_clients(clients.clone()))
            .and_then(handlers::unregister_handler));

    //Websocket route
    println!("Configuring websocket route");
    let ws_route = warp::path("ws")
        .and(warp::ws())
        .and(warp::path::param())
        .and(with_clients(clients.clone()))
        .and_then(handlers::ws_handler);

    let routes = static_site
        .or(health_route)
        .or(register_route)
        .or(ws_route)
        .with(warp::cors().allow_any_origin());

    let port:u16 = configs.get_int("port").unwrap().try_into().unwrap();
    let host:String = configs.get_string("host").unwrap();

    let addr: SocketAddr = format!("{}:{}", host, port)
    .parse()
    .expect("invalid host/port in config");

    println!("Starting Server");
    warp::serve(routes).run(addr).await;
        
}
//Extracts the clients data. Return a filter matching any route and composes the filter with a function
fn with_clients(clients: Clients) -> impl Filter<Extract = (Clients,),Error = Infallible> + Clone {
    warp::any().map(move || clients.clone())
}