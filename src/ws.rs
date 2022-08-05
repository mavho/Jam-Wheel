use crate::{Client,Clients};
use futures::{FutureExt, StreamExt};
use serde::{Deserialize, Serialize};
use serde_json::from_str;
use tokio::sync::mpsc;
use tokio_stream::wrappers::UnboundedReceiverStream;

use warp::ws::{WebSocket,Message};

#[derive(Deserialize,Serialize,Clone,Debug)]
pub struct ReleaseRequest{
    event: String,
    username: String,
    channel: String
}

#[derive(Deserialize,Serialize,Clone,Debug)]
pub struct KeyNoteRequest{
    //event: String,
    note: String,
    instrument: String,
    playnote: bool,
    username: String,
    channel: String
}
#[derive(Deserialize,Serialize,Clone,Debug)]
#[serde(untagged)]
//Untagged means that there is no explicit tag identifying which variant the data contains.
//Serde will try to match the data against each variant with deserialize
pub enum Request {
    KeyNote(KeyNoteRequest),
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
    /*
    //When you reach here there has been a disconnect from the sender client.
    */
    match clients.read().await.get(&id) {
        //If the client with the specified id exists
        Some(v) =>{
            //iterate through all clients. Send disconnect to all users subscribed to the topic who aren't the user.
            clients
                .read().await
                .iter()
                //clients subscribed to the topic
                .filter(|(_, client)| client.room.eq(&v.room))
                //Clients that aren't the sender
                .filter(|(_, client)| client.username.ne(&v.username))
                .for_each(|(_, client)| {
                    let disconnect = Request::Release(ReleaseRequest{
                        event: String::from("disconnect"),
                        username: v.username.clone(),
                        channel: v.room.clone()
                    });

                    let json = serde_json::to_string(&disconnect).unwrap();
                    //Send message from sender to clients.
                    if let Some(sender) = &client.sender {
                        let _ = sender.send(Ok(Message::text(json)));
                    }
                });
        },
        None => {},
    }
    clients.write().await.remove(&id);
    println!("{} disconnected",id);
}

/// Handles different types of client messages, and routes them to the correct room.
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
        Request::KeyNote(KeyNoteRequest{note,instrument,username,channel,playnote}) =>{
            //println!("keynote {} instrument {} user {} channel {} playnote {}",note, instrument,username, channel,playnote);

            //sets the keynote of the client to the inc message.
            if let Some(c) = clients.write().await.get_mut(client_id){
                c.note = Some(KeyNoteRequest{note:note.clone(),instrument:instrument.clone(),
                    username:username.clone(),channel:channel.clone(),playnote:playnote.clone()});
            }

            
            //holds the notes needed to send to all clients within the same room.
            let mut notes:Vec<KeyNoteRequest> = Vec::new();

            clients.read().await
                .iter()
                .filter(|(_, client)| {
                    //clients subscribed to the topic
                    if !client.room.eq(&channel) {
                        return false;
                    };
                    //AND must be playing a note.
                    match &client.note {
                        Some(v)=> return v.playnote,
                        None => return false,
                    };

                })
                .for_each(|(_, client)| {
                    match client.note.clone() {
                        Some(n) =>{notes.push(n);},
                        None=>{}
                    }
                });

            //sends the notes to all the clients.
            clients
                .read().await
                .iter()
                //clients subscribed to the topic
                .filter(|(_, client)| client.room.eq(&channel))
                .for_each(|(_, client)| {
                    let json = serde_json::to_string(&notes).unwrap();
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
                //clients subscribed to the topic
                .filter(|(_, client)| client.room.eq(&channel))
                //Clients that aren't the sender
                .filter(|(_, client)| client.username.ne(&username))
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
    }
}