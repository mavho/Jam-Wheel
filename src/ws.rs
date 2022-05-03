use crate::{Client,Clients};
use futures::{FutureExt, StreamExt};
use serde::{Deserialize, Serialize};
use serde_json::from_str;
use tokio::sync::mpsc;
use tokio_stream::wrappers::UnboundedReceiverStream;

use warp::ws::{WebSocket,Message};

#[derive(Deserialize,Serialize,Clone,Debug)]
pub struct TopicsRequest{
    topics: Vec<String>
}
#[derive(Deserialize,Serialize,Clone,Debug)]
pub struct ReleaseRequest{
    event: String,
    username: String,
    channel: String
}

#[derive(Deserialize,Serialize,Clone,Debug)]
pub struct KeyNoteRequest{
    event: String,
    note: String,
    instrument: String,
    toggle: bool,
    username: String,
    channel: String
}
#[derive(Deserialize,Serialize,Clone,Debug)]
#[serde(untagged)]
//Untagged means that there is no explicit tag identifying which variant the data contains.
//Serde will try to match the data against each variant with deserialize
enum Request {
    KeyNote(KeyNoteRequest),
    Topics(TopicsRequest),
    Release(ReleaseRequest)
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

    //Match incoming message against the Enum Request variants
    let request = match from_str::<Request>(&message){
        Ok(v) => v,
        Err(e)=>{
            eprintln!("Error while parsing message to request: {}",e);
            return;
        }
    };

    //destructure the request, and process them based on the type of request
    match request {
        Request::KeyNote(KeyNoteRequest{event,note,instrument,username,channel,toggle}) =>{
            //println!("keynote {} instrument {} user {} channel {} toggle {}",note, instrument,username, channel,toggle);

            clients
                .read().await
                .iter()
                //Clients that aren't the sender
                .filter(|(_, client)| match username.clone() {
                    v => client.username != v,
                })
                //clients subscribed to the topic
                .filter(|(_, client)| client.topics.contains(&channel))
                .for_each(|(_, client)| {
                    //We're using the variables (note,instrument..) outside this closure. We need to clone it
                    let forwarded_keynote = Request::KeyNote(KeyNoteRequest{
                        event:event.clone(),note:note.clone(),instrument:instrument.clone(),username:username.clone(),channel:channel.clone(),toggle:toggle.clone()
                    });

                    let json = serde_json::to_string(&forwarded_keynote).unwrap();
                    //Send message from sender to clients.
                    if let Some(sender) = &client.sender {
                        let _ = sender.send(Ok(Message::text(json)));
                    }
                });
        },
        Request::Release(ReleaseRequest{event,username,channel}) =>{
            clients
                .read().await
                .iter()
                //Clients that aren't the sender
                .filter(|(_, client)| match username.clone() {
                    v => client.username != v,
                })
                //clients subscribed to the topic
                .filter(|(_, client)| client.topics.contains(&channel))
                .for_each(|(_, client)| {
                    //We're using the variables (note,instrument..) outside this closure. We need to clone it
                    let forwarded_release = Request::Release(ReleaseRequest{
                        event:event.clone(),username:username.clone(),channel:channel.clone()
                    });

                    let json = serde_json::to_string(&forwarded_release).unwrap();
                    //Send message from sender to clients.
                    if let Some(sender) = &client.sender {
                        let _ = sender.send(Ok(Message::text(json)));
                    }
                });
        },
        Request::Topics(TopicsRequest{topics}) =>{
            //println!("topics {:?}",topics);
            let mut locked = clients.write().await;
            if let Some(v) = locked.get_mut(client_id){
                v.topics = topics;
            }
        }
    }
}