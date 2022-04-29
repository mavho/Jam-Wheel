use crate::{ws, Client, Clients, Result};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use warp::{http::StatusCode, reply::json, ws::Message, Reply};


//For Rest API (registering users)
#[derive(Deserialize,Debug)]
pub struct RegisterRequest {
    user_id: usize,
}

#[derive(Serialize,Debug)]
pub struct RegisterResponse {
    url: String,
}
//For broadcasting events
#[derive(Deserialize,Debug)]
pub struct Event{
    topic: String,
    user_id: Option<usize>,
    message:String
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

//broadcast message to clients
pub async fn publish_handler(body: Event, clients: Clients) -> Result<impl Reply> {
    clients
        .read().await
        .iter()
        //Clients that aren't the sender
        .filter(|(_, client)| match body.user_id {
            Some(v) => client.user_id == v,
            None => true,
        })
        //clients subscribed to the topic
        .filter(|(_, client)| client.topics.contains(&body.topic))
        .for_each(|(_, client)| {
            //Send message from sender to clients.
            if let Some(sender) = &client.sender {
                let _ = sender.send(Ok(Message::text(body.message.clone())));
            }
        });

    Ok(StatusCode::OK)
}


//Handles registering a user. A user id is sent in body
pub async fn register_handler(body: RegisterRequest, clients: Clients) -> Result<impl Reply> {
    let user_id = body.user_id;
    let uuid = Uuid::new_v4().simple().to_string();

    register_client(uuid.clone(),user_id,clients).await;
    Ok(json(&RegisterResponse {
        url: format!("ws://127.0.0.1:8000/ws/{}", uuid),
    }))
}

//Creates new client, and adds them to client list.
async fn register_client(id: String, user_id: usize, clients: Clients){
    //write is a Read write lock
    clients.write().await.insert(
        id,
        Client {
            user_id,
            topics: vec![String::from("cats")],
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