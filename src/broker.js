//requires
const Readline = require('parser-readline');
const SerialPort = require('serialport');
const io = require('socket.io').listen(3000);

class Broker {
    constructor() {
        //criando lista de subscribers
        this.subscribers = [];
        const self = this;
        this.notify = this.notify.bind(this);
        //abrindo a porta de comunicação com o Arduino
        this.serialPort = new SerialPort('/dev/ttyACM0', {
            baudRate: 9600
        });  
        //parser da serialPort para só publicar quando achar uma quebra de linha      
        this.parser =  this.serialPort.pipe(new Readline({ delimiter: "\n"}));

        io.on('connection', function (socket) {
            console.log('connected:', socket.client.id);
            //envia para o cliente uma mensagem 
            io.to(socket.client.id).emit('subscribe','oi')
            //agora o cliente responde com addMe e passa o sensor que ele quer receber mensagem
            socket.on('addMe', function (data) {
                data.id = socket.client.id;
                //insere na lista de subscribers
                self.subscribers.push(data)                
            });
        });
        

        this.newDistance = 0;

        //pega o valor do sensor faz o parseInt
        this.parser.on('data', function (data) {
            let distance = data.toString().trim();
            distance = parseInt(distance);
            console.log(distance);
            
            //condição para que não seja preciso publicar valores iguais
            if( distance > 0) {
                if(self.newDistance !== distance) {                    
                                            
                        self.newDistance = distance;
                        self.notify(self.newDistance);
                    
                }
                // console.log('Data:', distance);
            }
        });
    }

    //notificar para o id do subscriber o sensor especificado por ele
    notify(distance) {        
        if (this.subscribers.length > 0) {
            for(let index = 0; index < this.subscribers.length; index++) {            
                if(this.subscribers[index].sensor === 'sonar') {
                    io.to(this.subscribers[index].id).emit('newVal', distance);
                }
            }
        }
    }
}

const broker = new Broker();