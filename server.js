import express from "express";
const headers={
    "Content-Type":"text/event-stream",
    "Cache-Control":"no-cache",
    "Connection":"keep-alive"
};
const port =process.env.port??3000;
const app=express();
let clients = [];

// Function to send message to all clients
function sendToAllClients(message) {
    clients.forEach(client => {
        client.res.write(message+`\n\n`);
    });
}
app.use(express.static("public")).use(express.json()).use(express.urlencoded({
    extended:true
}))
app.get('/event', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send a message immediately
    res.write(`data: Connected\n\n`);
    // Store req and res objects
    clients.push({ req, res });
    
    sendToAllClients(`data: ${clients.length}`)
    // Clean up when the client closes the connection
    req.on('close', () => {
        clients = clients.filter(client => client.res !== res);
        sendToAllClients(`data: ${clients.length}`)
        res.end();
    });
});
app.get("/subscribers",(req,res)=>{
    res.json({
        status:"success",
        message:`Currently ${clients.length} subscribers connected`
    })
})
app.get('/send-message', (req, res) => {
    const { message } = req.query;
    if (!message) {
        res.status(400).send('data: Message parameter is required');
        return;
    }
    sendToAllClients(message);
    res.send('Message sent to all clients');
});
app.post('/message', (req, res) => {
    const { message } = req.body;
    if (!message) {
        res.status(400).send('Message parameter is required');
        return;
    }
    sendToAllClients("data: "+message);
    res.send('Message sent to all clients');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});