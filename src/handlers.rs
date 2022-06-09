use crate::{ws, Client, Clients, Result};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use warp::{http::StatusCode, reply::json, Reply};


//For Rest API (registering users)
#[derive(Deserialize,Debug)]
pub struct RegisterRequest {
    username: String,
}

#[derive(Serialize,Debug)]
pub struct RegisterResponse {
    url: String,
}

//Reply: a type that can be converted into a HTTP response
pub async fn ws_handler(ws: warp::ws::Ws,id:String, clients: Clients) -> Result<impl Reply>{
    println!("ws_handler");

    //find client in clients hashmap
    let client = clients.read().await.get(&id).cloned();

    match client {
        //handles client connection fn
        Some(c) => Ok(ws.on_upgrade(move |socket| ws::client_connection(socket,id,clients, c))),
        None => Err(warp::reject::not_found())
    }
}

//Handles registering a user. A user id is sent in body
pub async fn register_handler(body: RegisterRequest, clients: Clients) -> Result<impl Reply> {
    let username = body.username;
    let uuid = Uuid::new_v4().simple().to_string();

    register_client(uuid.clone(),username,clients).await;
    Ok(json(&RegisterResponse {
        url: format!("{}", uuid),
    }))
}

//Creates new client, and adds them to client list.
async fn register_client(id: String, username: String, clients: Clients){
    //write is a Read write lock
    clients.write().await.insert(
        id,
        Client {
            username,
            room: String::from("temp"),
            sender: None
        },
    );
}

//client will be disconnected.
pub async fn unregister_handler(id: String, clients:Clients) -> Result<impl Reply>{
    //The removed client is now moved out of scope (dropped)
    clients.write().await.remove(&id);
    Ok(StatusCode::OK)
}
//Return Ok message
pub async fn health_handler() -> Result<impl Reply>{
    Ok(StatusCode::OK)
}