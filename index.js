const path = require('path');
const express = require('express');
const db = require('./db.js');
const User = require('./user.js');
const app = express();

app.use(express.static("public"));
app.use("/",(req, res) =>{
    res.sendFile(path.join(__dirname, 'public/index.html'));
})

const HTTPServer = app.listen(30001,'0.0.0.0' ,()=>{
    console.log("Server is open at port 30001")
});

const wsModule = require('ws');
const user = require('./user.js');
const webSocketServer = new wsModule.Server(
    {
        server: HTTPServer,
    }
);

db();




function get_time(){
    const date = new Date();
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const dateStr = year + '-' + month + '-' + day + ' ' + date.toLocaleTimeString('ko-kr');
    return dateStr;
}


webSocketServer.on('connection', (ws, request)=>{

    //연결 클라이언트 IP 취득
    const ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    console.log(`새로운 클라이언트[${ip}] 접속`);

    User.find(function(error, User){
        if(error){
            console.log(error);
        }else{
            for(var i = 0; i<User.length; i++)
            {
                if(User[i].ip == ip)
                {
                    const currUser = {"ip": "True","time": `${User[i].time}`,"content": `${User[i].data}`}
                    console.log(currUser);
                    ws.send(JSON.stringify(currUser));
                } else {
                    const currUser = {"ip": "False","time": `${User[i].time}`,"content": `${User[i].data}`}
                    console.log(currUser);
                    ws.send(JSON.stringify(currUser));
                }
            }  
        }
    })

    //클라이언트로부터 메시지 수신 이벤트 처리
    ws.on('message', (msg)=>{
        console.log(`클라이언트[${ip}]에게 수신한 메시지 : ${msg}`);
        if(ws.readyState === ws.OPEN){ // 연결 여부 체크
            dateStr = get_time();
            const newUser = new User({"ip":`${ip}`, "time":`${dateStr}`, "data":`${msg}`});//mongoDB 저장용
            const SendUser = {"ip": "True","time": `${dateStr}`,"content": `${msg}`}// return 용
            const SendEachUser = {"ip": "False","time": `${dateStr}`,"content": `${msg}`}// each send 용

            newUser.save(function(error, data){
                if(error){
                    console.log(error);
                }else{
                    console.log('Saved!');
                }
            });
            webSocketServer.clients.forEach(function(client) {
                if(client == ws)
                {
                    client.send(JSON.stringify(SendUser)); 
                }
                else{
                    client.send(JSON.stringify(SendEachUser));
                }
            }); // 데이터 전송
        }
    })
    
    //에러 처러
    ws.on('error', (error)=>{
        console.log(`클라이언트[${ip}] 연결 에러발생 : ${error}`);
    })
    
    //연결 종료 이벤트 처리
    ws.on('close', ()=>{
        console.log(`클라이언트[${ip}] 웹소켓 연결 종료`);
    })
});

