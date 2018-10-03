const Readline = require('parser-readline');
const SerialPort = require('serialport');
const io = require('socket.io-client');

class Client{
    constructor () {
        //conectar o client nesse no socket porta 3000
        const socket = io.connect("http://localhost:3000/", {
            reconnection: true
        });
        // conectar no Arduino cliente
        this.serialPort = new SerialPort('/dev/ttyUSB0', {
            baudRate: 9600
        });  
        
        //Printando o valor que o arduino cliente recebe apenas para validar o resultado
        this.parser =  this.serialPort.pipe(new Readline({ delimiter: "\n"}));
        this.parser.on('data', function (data) {
            console.log('log', data);
            
        });
        const self = this;        

        //quando conectado no socket envia o sensor que quer ouvir
        socket.on('connect', function () {
            console.log('connected to localhost:3000');
            socket.on('subscribe', function (data) {
                socket.emit('addMe', {
                    sensor: 'sonar'
                });            
            });
            //escuta sempre que um valor novo é publicado
            socket.on('newVal', function(data) {
                // console.log(data);
                
                //manda para o serial port configurado (arduino cliente)
                self.serialPort.write(Buffer.from([data]))              
            });
        });         
    }
}
const client = new Client();