//Arc threadsafe reference-counting pointer
use std::{collections::HashMap, convert::Infallible, sync::Arc, str::FromStr};
use tokio::sync::{mpsc, RwLock};
use warp:: {ws::Message, Filter, Rejection};
use warp::{filters::BoxedFilter, http::Uri, path::FullPath, redirect,  Reply};
mod handlers;
mod ws;

const WEB_FOLDER: &str = "web-folder/";

//client struct
#[derive(Debug,Clone)]
pub struct Client{
    //rand uuid
    pub user_id: usize,
    pub topics :Vec<String>,
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

    //Creates a threadsafe hashmap of clients
    let clients: Clients = Arc::new(RwLock::new(HashMap::new()));

    let html_content = warp::fs::dir(WEB_FOLDER);

    let index = warp::get().and(warp::path::end())
        .and(warp::fs::file(format!("{}/templates/_includes/landing_page.html",WEB_FOLDER)));

    let js =  warp::get().and(warp::path!("static"))
        .and(warp::fs::dir(format!("{}/static/js/",WEB_FOLDER)));

    

    let static_site = html_content.or(index).or(js);

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

     let publish = warp::path!("publish")
        .and(warp::body::json())
        .and(with_clients(clients.clone()))
        .and_then(handlers::publish_handler);

    //Websocket route
    println!("Configuring websocket route");
    let ws_route = warp::path("ws")
        .and(warp::ws())
        .and(warp::path::param())
        .and(with_clients(clients.clone()))
        .and_then(handlers::ws_handler);

    let routes = root_redirect()
        .or(static_site)
        .or(health_route)
        .or(register_route)
        .or(ws_route)
        .or(publish)
        .with(warp::cors().allow_any_origin());

    println!("Starting Server");

    warp::serve(routes).run(([0,0,0,0],8000)).await;
}

fn root_redirect() -> BoxedFilter<(impl Reply,)> {
    warp::path::full()
        .and_then(move |path: FullPath| async move {
            let path = path.as_str();

            // do not redirect if the path ends in a trailing slash
            // or contains a period (indicating a specific file, e.g. style.css)
            if path.ends_with("/") || path.contains(".") {
                return Err(warp::reject());
            }

            Ok(redirect::redirect(
                Uri::from_str(&[path, "/"].concat()).unwrap(),
            ))
        })
        .boxed()
}
//Extracts the clients data. Return a filter matching any route and composes the filter with a function
fn with_clients(clients: Clients) -> impl Filter<Extract = (Clients,),Error = Infallible> + Clone {
    warp::any().map(move || clients.clone())
}