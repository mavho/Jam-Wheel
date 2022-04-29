use crate::{Client,Clients};
use futures::{FutureExt, StreamExt};
use serde::Deserialize;
use serde_json::from_str;
use tokio::sync::mpsc;
use tokio_stream::wrappers::UnboundedReceiverStream;

use warp::ws::{WebSocket,Message};

#[derive(Deserialize,Debug)]
pub struct TopicsRequest{
    topics: Vec<String>
}
pub async fn client_connection(ws: WebSocket,id: String,clients: Clients, mut client: Client){
    println!("establishing client connection... {:?}", ws);

    //split into Stream and Sink obj
    let (client_ws_sender, mut client_ws_recv) = ws.split();

    let (client_sender, client_recv) = mpsc::unbounded_channel();

    //client_rev -> unbounded receiver stream
    let client_recv = UnboundedReceiverStream::new(client_recv);

    //keep stream open until client has disconnected
    tokio::task::spawn(client_recv.forward(client_ws_sender).map( |result| {
        if let Err(e) = result{
            println!("error sending websocket msg: {}",e);
        }
    }));

    client.sender = Some(client_sender);
    clients.write().await.insert(id.clone(),client);
    println!("{} connected",id);


    //Handles messages from the client
    while let Some(result) = client_ws_recv.next().await {
        //item received in event loop (stream)
        //If there is an error, disconnect client
        let msg = match result {
            Ok(msg) => msg,
            Err(e) => {
                println!("error receiving message for id {}): {}",id.clone(),e);
                break;
            }
        };
        client_msg(&id,msg,&clients).await;
    }
    //client disconnect handler
    clients.write().await.remove(&id);
    println!("{} disconnected",id);
}

//Given a message and client id, send a pong message back to the client. Or do nothing.
async fn client_msg(client_id: &str, msg:Message, clients:&Clients){
    println!("Received message from {}: {:?}",client_id,msg);

    let message = match msg.to_str(){
        Ok(v) => v,
        Err(_)=> return,
    };
    if message == "ping" || message =="ping\n"{
        return;
    }

    //client sent a JSON to the WS, parse the JSON.
    let topics_req: TopicsRequest = match from_str(&message){
        Ok(v) => v,
        Err(e) =>{
            eprintln!("Error while parsing message to topics request: {}",e);
            return;
        }
    };

    //Update client's incoming topics
    let mut locked = clients.write().await;
    if let Some(v) = locked.get_mut(client_id){
        v.topics = topics_req.topics;
    }
}