//Arc threadsafe reference-counting pointer
use std::{collections::HashMap, convert::Infallible, sync::Arc};
use tokio::sync::{mpsc, RwLock};
use warp:: {ws::Message, Filter, Rejection};
use ws::KeyNoteRequest;
mod handlers;
mod ws;

const WEB_FOLDER: &str = "web-folder/";

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
    //Sets dev configuration or prod. Dev is either true or false
    let dev: bool = match std::env::var("DEV"){
        Ok(v) => v.parse::<bool>().unwrap(),
        Err(_e)=> false 
    };

    let port: u16 = match std::env::var("PORT"){
        Ok(v) => v.parse::<u16>().unwrap(),
        Err(_e)=> 8000
    };
    //Creates a threadsafe hashmap of clients
    let clients: Clients = Arc::new(RwLock::new(HashMap::new()));

    let html_content = warp::fs::dir(WEB_FOLDER);

    let index = warp::get().and(warp::path::end())
        .and(warp::fs::file(format!("{}/templates/_layouts/index.html",WEB_FOLDER)));

    /*
    let templates = warp::get().and(warp::path!("templates"))
        .and(warp::fs::dir(format!("{}/templates/_includes/",WEB_FOLDER)));
    */

    let js =  warp::get().and(warp::path!("static"))
        .and(warp::fs::dir(format!("{}/static/js/",WEB_FOLDER)));

    

    let static_site = index.or(js).or(html_content);

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

    println!("Starting Server");

    if dev{
        println!("Dev configuration detected");
        //use our dev config
        warp::serve(routes)
            .tls()
            .cert_path("cert.pem")
            .key_path("key.rsa")
            .run(([0,0,0,0],port)).await;
    }else{
        println!("Heroku configuration detected");
        //Heroku wraps https for our application
        warp::serve(routes)
            .run(([0,0,0,0],port)).await;
    }
}
//Extracts the clients data. Return a filter matching any route and composes the filter with a function
fn with_clients(clients: Clients) -> impl Filter<Extract = (Clients,),Error = Infallible> + Clone {
    warp::any().map(move || clients.clone())
}