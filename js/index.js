const path = require('path');

const express = require('express');
const app = express();

app.use("/",(req, res) =>{
    res.sendFile(path.join(__dirname, './index.html'));
})

const HTTPServer = app.listen(30001, ()=>{
    console.log("Server is open at port 30001")
});

const wsModule = require('ws');
const webSocketServer = new wsModule.Server(
    {
        server: HTTPServer,
    }
);

webSocketServer.on('connection', (ws, request)=>{

    //연결 클라이언트 IP 취득
    const ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    
    console.log(`새로운 클라이언트[${ip}] 접속`);
    

    //클라이언트로부터 메시지 수신 이벤트 처리
    ws.on('message', (msg)=>{
        console.log(`클라이언트[${ip}]에게 수신한 메시지 : ${msg}`);
        if(ws.readyState === ws.OPEN){ // 연결 여부 체크
            ws.send(`${msg}`); // 데이터 전송
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