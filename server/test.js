const SerialPort = require('serialport');
// const { SerialPort } = require('serialport')
const Readline = require('@serialport/parser-readline');


const port = new SerialPort('COM3', {baudRate: 9600});

const parser = new Readline();
port.pipe(parser);
SerialPort.list().then(ports => {
    ports.forEach(function(port) {
        console.log(port.path)
    })
})

parser.on('data', (line) => console.log('Arduino Output: ' + line));

console.log('Starting Sending Data');
// port.write('123');
// port.write('PRINT THIS');
port.write(123)

// port.write('main screen turn on', function(err) {
//     if (err) {
//       return console.log('Error on write: ', err.message)
//     }
//     console.log('message written')
//   })
  
// // Open errors will be emitted as an error event
// port.on('error', function(err) {
// console.log('Error: ', err.message)
// })


// const { SerialPort } = require('serialport')


// // Create a port
// const port = new SerialPort({
//   path: 'COM3',
//   baudRate: 9600,
// })

// port.write('main screen turn on', function(err) {
//     if (err) {
//       return console.log('Error on write: ', err.message)
//     }
//     console.log('message written')
//   })
  
//   // Open errors will be emitted as an error event
//   port.on('error', function(err) {
//     console.log('Error: ', err.message)
//   })