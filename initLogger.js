const winston = require('winston');

module.exports = () => {
  winston.addColors({debug: 'magenta'});
  winston.configure({
    level: 'info',
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
    transports: [
      new winston.transports.Console()
    ]
  });
}
